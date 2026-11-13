import type { Endpoint, PayloadRequest, Where } from 'payload'
import {
  AdoptError, clientKey, publicPanels, settleStale, startCheckout, syncAdoption,
  type Adoption, type AdoptionStore,
} from './adoptions'
import { mockVipps, verifyWebhook, vippsClient, vippsConfig, type Vipps, type VippsConfig } from './vipps'

const collection = 'panel-adoptions'
const websiteURL = () => process.env.ADOPT_WEBSITE_URL || 'https://nordlysntnu.no'

function payloadStore(req: PayloadRequest): AdoptionStore {
  const { payload } = req
  const find = async (where: Where, limit?: number) => (await payload.find({
    collection, where, depth: 0, overrideAccess: true, sort: 'expiresAt',
    ...(limit ? { limit } : { pagination: false }),
  })).docs as unknown as Adoption[]
  return {
    holding: now => find({ or: [
      { status: { in: ['paid', 'authorized'] } },
      { and: [{ status: { equals: 'pending' } }, { expiresAt: { greater_than: now.toISOString() } }] },
    ] }),
    stale: (now, limit) => find({ and: [{ status: { equals: 'pending' } }, { expiresAt: { less_than_equal: now.toISOString() } }] }, limit),
    byReference: async reference => (await find({ reference: { equals: reference } }, 1))[0] ?? null,
    create: data => payload.create({ collection, data, overrideAccess: true }) as unknown as Promise<Adoption>,
    update: (id, data) => payload.update({ collection, id, data, overrideAccess: true }) as unknown as Promise<Adoption>,
  }
}

// One client per process, so the token cache (and the local mock) are kept between requests.
let current: { config: VippsConfig; vipps: Vipps } | null = null
function vippsFor(req: PayloadRequest): { config: VippsConfig; vipps: Vipps } | null {
  let config: VippsConfig | null
  try {
    config = vippsConfig()
  } catch (error) {
    req.payload.logger.error({ msg: 'Vipps is not configured correctly', err: error })
    return null
  }
  if (!config) return null
  if (!current || JSON.stringify(current.config) !== JSON.stringify(config)) {
    current = { config, vipps: config.mode === 'mock' ? mockVipps() : vippsClient(config) }
  }
  return current
}

// The website calls these endpoints from another origin.
function allowedOrigin(origin: string | null) {
  if (!origin) return null
  const site = new URL(websiteURL())
  const hosts = [site.host, site.host.startsWith('www.') ? site.host.slice(4) : `www.${site.host}`]
  try {
    const from = new URL(origin)
    if (from.protocol === site.protocol && hosts.includes(from.host)) return origin
  } catch {
    return null
  }
  if (process.env.CMS_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin
  return null
}

function reply(req: PayloadRequest, body: unknown, status = 200) {
  const headers = new Headers({ 'Cache-Control': 'no-store' })
  const origin = allowedOrigin(req.headers.get('origin'))
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Vary', 'Origin')
  }
  return Response.json(body, { status, headers })
}

function failure(req: PayloadRequest, error: unknown) {
  if (error instanceof AdoptError) return reply(req, { error: error.message }, error.status)
  req.payload.logger.error({ msg: 'Panel adoption request failed', err: error })
  return reply(req, { error: 'Something went wrong. Please try again later.' }, 500)
}

// The last X-Forwarded-For entry is added by our nginx, so it cannot be faked by the client.
function clientIP(req: PayloadRequest) {
  return req.headers.get('x-forwarded-for')?.split(',').pop()?.trim() || 'local'
}

// Simple per-client limit on starting payments (in memory; the CMS is one process).
const attempts = new Map<string, number[]>()
function tooManyAttempts(client: string, now = Date.now()) {
  const recent = (attempts.get(client) ?? []).filter(time => time > now - 10 * 60_000)
  recent.push(now)
  attempts.set(client, recent)
  if (attempts.size > 5000) attempts.clear()
  return recent.length > 10
}

export const adoptionEndpoints: Endpoint[] = [
  { path: '/adopt/panels', method: 'get', handler: async (req) => {
    try {
      const store = payloadStore(req)
      const active = vippsFor(req)
      if (active) await settleStale(store, active.vipps)
      return reply(req, { open: Boolean(active), taken: await publicPanels(store) })
    } catch (error) { return failure(req, error) }
  } },

  { path: '/adopt/checkout', method: 'post', handler: async (req) => {
    try {
      const active = vippsFor(req)
      if (!active) throw new AdoptError('Adoption is not open yet.', 503)
      const client = clientKey(clientIP(req), process.env.PAYLOAD_SECRET || '')
      if (tooManyAttempts(client)) throw new AdoptError('Too many attempts. Please wait a few minutes.', 429)
      const text = await req.text!()
      if (text.length > 10_000) throw new AdoptError('The request is too large.', 413)
      let body: unknown
      try { body = JSON.parse(text) } catch { throw new AdoptError('Invalid request.', 400) }
      const result = await startCheckout({ store: payloadStore(req), vipps: active.vipps, body, client, websiteURL: websiteURL() })
      return reply(req, result, 201)
    } catch (error) { return failure(req, error) }
  } },

  { path: '/adopt/status', method: 'get', handler: async (req) => {
    try {
      const reference = new URL(req.url!).searchParams.get('reference') || ''
      if (!/^nordlys-adopt-[0-9a-f]{20}$/.test(reference)) throw new AdoptError('Unknown payment.', 404)
      const store = payloadStore(req)
      let adoption = await store.byReference(reference)
      if (!adoption) throw new AdoptError('Unknown payment.', 404)
      const active = vippsFor(req)
      if (active) adoption = await syncAdoption(store, active.vipps, adoption)
      const status = adoption.status === 'authorized' ? 'pending' : adoption.status
      return reply(req, { status, panels: status === 'paid' ? adoption.panels : [] })
    } catch (error) { return failure(req, error) }
  } },

  { path: '/adopt/webhook', method: 'post', handler: async (req) => {
    try {
      const active = vippsFor(req)
      if (!active || active.config.mode === 'mock' || !active.config.webhookSecret) return Response.json({ ok: false }, { status: 404 })
      const rawBody = await req.text!()
      const url = new URL(req.url!)
      const host = new URL(process.env.CMS_URL || url.origin).host
      const valid = verifyWebhook({ secret: active.config.webhookSecret, rawBody, pathAndQuery: url.pathname + url.search, host, headers: req.headers })
      if (!valid) return Response.json({ ok: false }, { status: 401 })
      const reference = String(JSON.parse(rawBody)?.reference ?? '')
      const store = payloadStore(req)
      const adoption = await store.byReference(reference)
      // Never trust the webhook body for the state: ask Vipps.
      if (adoption) await syncAdoption(store, active.vipps, adoption)
      return Response.json({ ok: true })
    } catch (error) {
      req.payload.logger.error({ msg: 'Vipps webhook failed', err: error })
      return Response.json({ ok: false }, { status: 500 })
    }
  } },
]
