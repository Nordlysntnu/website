import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { getPayload, handleEndpoints } from 'payload'
import { PANELS, priceFor } from '../../src/features/adopt/adopt.mjs'
import { AdoptError, publicPanels, startCheckout, syncAdoption, type Adoption, type AdoptionStore, type NewAdoption } from '../src/lib/adoptions'
import { mockVipps, verifyWebhook, vippsClient, vippsConfig, type PaymentInfo, type Vipps } from '../src/lib/vipps'

const ids = (count: number, from = 0) => PANELS.slice(from, from + count).map(panel => panel.id)

function memoryStore() {
  const rows: Adoption[] = []
  let next = 1
  const store: AdoptionStore = {
    async holding(now) {
      return rows.filter(row => row.status === 'paid' || row.status === 'authorized' || (row.status === 'pending' && new Date(row.expiresAt) > now))
    },
    async stale(now, limit) {
      return rows.filter(row => row.status === 'pending' && new Date(row.expiresAt) <= now).slice(0, limit)
    },
    async byReference(reference) { return rows.find(row => row.reference === reference) ?? null },
    async create(data: NewAdoption) { const row = { ...data, id: next++ }; rows.push(row); return { ...row } },
    async update(id, data) { const row = rows.find(other => other.id === id)!; Object.assign(row, data); return { ...row } },
  }
  return { store, rows }
}

// A Vipps stand-in whose answers the test controls.
function scriptedVipps(state: PaymentInfo['state']) {
  const calls: string[] = []
  const vipps: Vipps & { state: string } = {
    state,
    async createPayment({ returnUrl }) { calls.push('create'); return { redirectUrl: 'https://vipps.example/pay?return=' + encodeURIComponent(returnUrl) } },
    async getPayment() { calls.push('get'); return { state: vipps.state, authorizedOre: 0, capturedOre: 0 } },
    async capture(_reference, amountOre) { calls.push('capture'); return { state: 'AUTHORIZED', authorizedOre: amountOre, capturedOre: amountOre } },
    async cancel() { calls.push('cancel') },
  }
  return { vipps, calls }
}

const checkout = (store: AdoptionStore, vipps: Vipps, body: unknown, client = 'client-a', now?: Date) =>
  startCheckout({ store, vipps, body, client, websiteURL: 'https://nordlysntnu.no', now })

test('Vipps settings: closed without VIPPS_ENV, mock never in production, keys required', () => {
  assert.equal(vippsConfig({}), null)
  assert.deepEqual(vippsConfig({ VIPPS_ENV: 'mock' }), { mode: 'mock' })
  assert.throws(() => vippsConfig({ VIPPS_ENV: 'mock', CMS_ENV: 'production' }), /local testing/)
  assert.throws(() => vippsConfig({ VIPPS_ENV: 'test' }), /VIPPS_CLIENT_ID/)
  assert.throws(() => vippsConfig({ VIPPS_ENV: 'live' }), /test, production or mock/)
  const keys = { VIPPS_CLIENT_ID: 'id', VIPPS_CLIENT_SECRET: 'secret', VIPPS_SUBSCRIPTION_KEY: 'sub', VIPPS_MSN: '123456' }
  assert.equal((vippsConfig({ VIPPS_ENV: 'test', ...keys }) as { baseURL: string }).baseURL, 'https://apitest.vipps.no')
  assert.equal((vippsConfig({ VIPPS_ENV: 'production', ...keys }) as { baseURL: string }).baseURL, 'https://api.vipps.no')
})

test('the Vipps client sends the documented headers and bodies and reuses its token', async () => {
  const requests: { url: string; init: RequestInit }[] = []
  const fakeFetch = (async (url: string, init: RequestInit) => {
    requests.push({ url, init })
    if (url.endsWith('/accesstoken/get')) return new Response(JSON.stringify({ access_token: 'token-1', expires_in: 3600 }))
    if (url.endsWith('/capture')) return new Response(JSON.stringify({ state: 'AUTHORIZED', aggregate: { capturedAmount: { currency: 'NOK', value: 69900 } } }))
    if (init.method === 'GET') return new Response(JSON.stringify({ state: 'AUTHORIZED', aggregate: { authorizedAmount: { currency: 'NOK', value: 69900 }, capturedAmount: { currency: 'NOK', value: 0 } } }))
    return new Response(JSON.stringify({ redirectUrl: 'https://apitest.vipps.no/redirect', reference: 'r' }))
  }) as typeof fetch
  const client = vippsClient({ mode: 'test', baseURL: 'https://apitest.vipps.no', clientId: 'id', clientSecret: 'secret', subscriptionKey: 'sub', msn: '123456' }, fakeFetch)

  const created = await client.createPayment({ reference: 'nordlys-adopt-0123456789abcdef0123', amountOre: 69900, description: 'Adopt 10 solar panels', returnUrl: 'https://nordlysntnu.no/adopt?reference=x' })
  assert.equal(created.redirectUrl, 'https://apitest.vipps.no/redirect')
  assert.deepEqual(await client.getPayment('nordlys-adopt-0123456789abcdef0123'), { state: 'AUTHORIZED', authorizedOre: 69900, capturedOre: 0 })
  assert.equal((await client.capture('nordlys-adopt-0123456789abcdef0123', 69900)).capturedOre, 69900)

  const token = requests.filter(request => request.url.endsWith('/accesstoken/get'))
  assert.equal(token.length, 1, 'the token is reused')
  const tokenHeaders = token[0].init.headers as Record<string, string>
  assert.equal(tokenHeaders.client_id, 'id')
  assert.equal(tokenHeaders.client_secret, 'secret')
  assert.equal(tokenHeaders['Ocp-Apim-Subscription-Key'], 'sub')
  assert.equal(tokenHeaders['Merchant-Serial-Number'], '123456')

  const create = requests.find(request => request.url.endsWith('/epayment/v1/payments'))!
  const createHeaders = create.init.headers as Record<string, string>
  assert.equal(createHeaders.Authorization, 'Bearer token-1')
  assert.equal(createHeaders['Idempotency-Key'], 'create-nordlys-adopt-0123456789abcdef0123')
  assert.deepEqual(JSON.parse(String(create.init.body)), {
    amount: { currency: 'NOK', value: 69900 }, paymentMethod: { type: 'WALLET' },
    reference: 'nordlys-adopt-0123456789abcdef0123', paymentDescription: 'Adopt 10 solar panels',
    returnUrl: 'https://nordlysntnu.no/adopt?reference=x', userFlow: 'WEB_REDIRECT',
  })
  const capture = requests.find(request => request.url.endsWith('/capture'))!
  assert.deepEqual(JSON.parse(String(capture.init.body)), { modificationAmount: { currency: 'NOK', value: 69900 } })
})

test('webhook signatures are checked against the body, path, host and date', () => {
  const secret = 'webhook-secret'
  const rawBody = JSON.stringify({ reference: 'nordlys-adopt-x', name: 'AUTHORIZED' })
  const date = 'Thu, 13 Nov 2026 10:00:00 GMT'
  const hash = createHash('sha256').update(rawBody).digest('base64')
  const signature = createHmac('sha256', secret).update(`POST\n/api/adopt/webhook\n${date};cms.nordlysntnu.no;${hash}`).digest('base64')
  const headers = new Headers({ 'x-ms-date': date, 'x-ms-content-sha256': hash,
    authorization: `HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=${signature}` })
  const check = (overrides: Partial<Parameters<typeof verifyWebhook>[0]>) =>
    verifyWebhook({ secret, rawBody, pathAndQuery: '/api/adopt/webhook', host: 'cms.nordlysntnu.no', headers, ...overrides })
  assert.equal(check({}), true)
  assert.equal(check({ rawBody: rawBody.replace('AUTHORIZED', 'CAPTURED') }), false)
  assert.equal(check({ secret: 'other' }), false)
  assert.equal(check({ host: 'evil.example' }), false)
  assert.equal(check({ headers: new Headers() }), false)
})

test('checkout holds the panels, sets the price on the server and captures after approval', async () => {
  const { store, rows } = memoryStore()
  const { vipps, calls } = scriptedVipps('CREATED')
  const result = await checkout(store, vipps, { panels: ids(10), name: '  Ola\u0000 Nordmann ', price: 1 })
  assert.match(result.reference, /^nordlys-adopt-[0-9a-f]{20}$/)
  assert.match(result.redirectUrl, /return=https%3A%2F%2Fnordlysntnu\.no%2Fadopt%3Freference%3Dnordlys-adopt-/)
  assert.equal(rows[0].amount, priceFor(10).total)
  assert.equal(rows[0].amount, 699)
  assert.equal(rows[0].displayName, 'Ola Nordmann')

  let taken = await publicPanels(store)
  assert.equal(taken.length, 10)
  assert.ok(taken.every(panel => panel.held && panel.name === null), 'unpaid panels are held without a name')
  await assert.rejects(checkout(store, vipps, { panels: [ids(10)[3]] }, 'client-b'), (error: AdoptError) => error.status === 409)

  vipps.state = 'AUTHORIZED'
  const paid = await syncAdoption(store, vipps, rows[0])
  assert.equal(paid.status, 'paid')
  assert.deepEqual(calls, ['create', 'get', 'capture'])
  taken = await publicPanels(store)
  assert.ok(taken.every(panel => !panel.held && panel.name === 'Ola Nordmann'))
  assert.equal(await syncAdoption(store, vipps, paid).then(row => row.status), 'paid', 'a paid adoption is final')
  assert.equal(calls.length, 3)
})

test('cancelled, expired and failed payments free the panels again', async () => {
  const { store, rows } = memoryStore()
  const { vipps } = scriptedVipps('ABORTED')
  await checkout(store, vipps, { panels: ids(2) })
  assert.equal((await syncAdoption(store, vipps, rows[0])).status, 'cancelled')
  assert.equal((await publicPanels(store)).length, 0)

  // Still CREATED after the hold ran out: cancelled at Vipps and freed.
  const start = new Date('2026-11-13T10:00:00Z')
  vipps.state = 'CREATED'
  await checkout(store, vipps, { panels: ids(2) }, 'client-a', start)
  const later = new Date(start.getTime() + 16 * 60_000)
  assert.equal((await publicPanels(store, later)).length, 0, 'the hold runs out after 15 minutes')
  assert.equal((await syncAdoption(store, vipps, rows[1], later)).status, 'cancelled')

  // Vipps refuses to start the payment.
  const broken = { ...mockVipps(), createPayment: async () => { throw new Error('down') } }
  await assert.rejects(checkout(store, broken, { panels: ids(1) }), (error: AdoptError) => error.status === 502)
  assert.equal(rows[2].status, 'failed')
  assert.equal((await publicPanels(store)).length, 0)
})

test('checkout rejects bad input and limits how many panels one person can hold', async () => {
  const { store } = memoryStore()
  const vipps = mockVipps()
  for (const body of [{}, { panels: [] }, { panels: ['Z99'] }, { panels: [ids(1)[0], ids(1)[0]] }, { panels: ids(51) }, null]) {
    await assert.rejects(checkout(store, vipps, body), (error: AdoptError) => error.status === 400, JSON.stringify(body))
  }
  await checkout(store, vipps, { panels: ids(50) })
  await assert.rejects(checkout(store, vipps, { panels: ids(1, 60) }), (error: AdoptError) => error.status === 429)
  await checkout(store, vipps, { panels: ids(1, 60) }, 'client-b')
})

test('the adoption endpoints work end to end with the mock Vipps and real Payload', async () => {
  const dataDir = path.resolve('.local/tests/adopt-' + randomUUID())
  await mkdir(dataDir, { recursive: true, mode: 0o700 })
  Object.assign(process.env, {
    CMS_ENV: 'local', CMS_URL: 'http://127.0.0.1:3010', NODE_ENV: 'test', VIPPS_ENV: 'mock',
    ADOPT_WEBSITE_URL: 'https://nordlysntnu.no', PAYLOAD_SECRET: randomBytes(48).toString('hex'), CMS_DATA_DIR: dataDir,
    DATABASE_URL: 'file:' + path.join(dataDir, 'cms.db').replaceAll('\\', '/'), CMS_SCHEMA_PUSH: 'false',
  })
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })
  payload.logger.level = 'fatal'
  await payload.db.migrate()
  const base = 'http://127.0.0.1:3010'
  const call = (url: string, init: RequestInit = {}, origin = 'https://nordlysntnu.no') =>
    handleEndpoints({ config, path: new URL(url, base).pathname, request: new Request(base + url, { ...init, headers: { Origin: origin, ...init.headers } }) })

  let response = await call('/api/adopt/panels')
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://nordlysntnu.no')
  assert.deepEqual(await response.json(), { open: true, taken: [] })
  response = await call('/api/adopt/panels', {}, 'https://evil.example')
  assert.equal(response.headers.get('access-control-allow-origin'), null, 'other sites get no CORS access')

  response = await call('/api/adopt/checkout', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({ panels: ids(5), name: 'Kari' }) })
  assert.equal(response.status, 201, await response.clone().text())
  const { reference, redirectUrl } = await response.json()
  assert.equal(redirectUrl, `https://nordlysntnu.no/adopt?reference=${reference}`)

  response = await call('/api/adopt/status?reference=' + reference)
  assert.deepEqual(await response.json(), { status: 'paid', panels: ids(5) })
  response = await call('/api/adopt/panels')
  const { taken } = await response.json()
  assert.deepEqual(taken.map((panel: { id: string }) => panel.id), ids(5))
  assert.ok(taken.every((panel: { name: string; held: boolean }) => panel.name === 'Kari' && !panel.held))

  const stored = await payload.find({ collection: 'panel-adoptions', overrideAccess: true })
  assert.equal(stored.docs[0].amount, 399)
  assert.equal(stored.docs[0].status, 'paid')

  response = await call('/api/panel-adoptions')
  assert.notEqual(response.status, 200, 'anonymous visitors cannot list adoptions')
  response = await call('/api/adopt/status?reference=nordlys-adopt-' + '0'.repeat(20))
  assert.equal(response.status, 404)
  response = await call('/api/adopt/webhook', { method: 'POST', body: '{}' })
  assert.equal(response.status, 404, 'the webhook is off in mock mode')
  await payload.destroy?.()
})
