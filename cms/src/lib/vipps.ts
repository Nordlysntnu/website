import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Vipps MobilePay ePayment API, used for "Adopt a solar panel".
 * VIPPS_ENV: test (apitest.vipps.no), production (api.vipps.no) or mock (local testing only).
 * Without VIPPS_ENV adoption is closed. Keys live only in the CMS env file, never in Git.
 */
export type VippsConfig =
  | { mode: 'mock' }
  | { mode: 'test' | 'production'; baseURL: string; clientId: string; clientSecret: string; subscriptionKey: string; msn: string; webhookSecret?: string }

export function vippsConfig(env: Record<string, string | undefined> = process.env): VippsConfig | null {
  const mode = env.VIPPS_ENV
  if (!mode) return null
  if (mode === 'mock') {
    if (env.CMS_ENV === 'production') throw new Error('VIPPS_ENV=mock is only for local testing.')
    return { mode }
  }
  if (mode !== 'test' && mode !== 'production') throw new Error('VIPPS_ENV must be test, production or mock.')
  const keys = ['VIPPS_CLIENT_ID', 'VIPPS_CLIENT_SECRET', 'VIPPS_SUBSCRIPTION_KEY', 'VIPPS_MSN'] as const
  const missing = keys.filter(key => !env[key])
  if (missing.length) throw new Error(`Set ${missing.join(', ')} to use Vipps.`)
  return {
    mode,
    baseURL: mode === 'production' ? 'https://api.vipps.no' : 'https://apitest.vipps.no',
    clientId: env.VIPPS_CLIENT_ID!, clientSecret: env.VIPPS_CLIENT_SECRET!,
    subscriptionKey: env.VIPPS_SUBSCRIPTION_KEY!, msn: env.VIPPS_MSN!,
    webhookSecret: env.VIPPS_WEBHOOK_SECRET || undefined,
  }
}

export type PaymentInfo = { state: string; authorizedOre: number; capturedOre: number }

export interface Vipps {
  createPayment(input: { reference: string; amountOre: number; description: string; returnUrl: string }): Promise<{ redirectUrl: string }>
  getPayment(reference: string): Promise<PaymentInfo>
  capture(reference: string, amountOre: number): Promise<PaymentInfo>
  cancel(reference: string): Promise<void>
}

export class VippsError extends Error {
  constructor(message: string, readonly status: number, readonly body: string) { super(message) }
}

const systemHeaders = {
  'Vipps-System-Name': 'nordlys-cms',
  'Vipps-System-Version': '0.1.0',
  'Vipps-System-Plugin-Name': 'nordlys-adopt-a-panel',
  'Vipps-System-Plugin-Version': '1.0.0',
}

const amountOf = (value: unknown) => Number((value as { value?: number } | undefined)?.value ?? 0)
const paymentInfo = (body: any): PaymentInfo => ({
  state: String(body?.state ?? ''),
  authorizedOre: amountOf(body?.aggregate?.authorizedAmount),
  capturedOre: amountOf(body?.aggregate?.capturedAmount),
})

export function vippsClient(config: Exclude<VippsConfig, { mode: 'mock' }>, fetcher: typeof fetch = fetch): Vipps {
  let token: { value: string; expires: number } | null = null

  async function accessToken() {
    if (token && token.expires > Date.now() + 60_000) return token.value
    const response = await fetcher(`${config.baseURL}/accesstoken/get`, {
      method: 'POST',
      headers: { client_id: config.clientId, client_secret: config.clientSecret,
        'Ocp-Apim-Subscription-Key': config.subscriptionKey, 'Merchant-Serial-Number': config.msn, ...systemHeaders },
    })
    const text = await response.text()
    if (!response.ok) throw new VippsError('Vipps access token request failed.', response.status, text)
    const body = JSON.parse(text)
    token = { value: body.access_token, expires: Date.now() + Number(body.expires_in ?? 3600) * 1000 }
    return token.value
  }

  async function request(method: string, path: string, body?: unknown, idempotencyKey?: string) {
    const response = await fetcher(`${config.baseURL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${await accessToken()}`,
        'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        'Merchant-Serial-Number': config.msn,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        ...systemHeaders,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    const text = await response.text()
    if (!response.ok) throw new VippsError(`Vipps ${method} ${path} failed.`, response.status, text)
    return text ? JSON.parse(text) : {}
  }

  return {
    async createPayment({ reference, amountOre, description, returnUrl }) {
      const body = await request('POST', '/epayment/v1/payments', {
        amount: { currency: 'NOK', value: amountOre },
        paymentMethod: { type: 'WALLET' },
        reference, paymentDescription: description, returnUrl, userFlow: 'WEB_REDIRECT',
      }, `create-${reference}`)
      if (typeof body.redirectUrl !== 'string') throw new VippsError('Vipps did not return a redirect URL.', 502, JSON.stringify(body))
      return { redirectUrl: body.redirectUrl }
    },
    async getPayment(reference) {
      return paymentInfo(await request('GET', `/epayment/v1/payments/${encodeURIComponent(reference)}`))
    },
    async capture(reference, amountOre) {
      return paymentInfo(await request('POST', `/epayment/v1/payments/${encodeURIComponent(reference)}/capture`,
        { modificationAmount: { currency: 'NOK', value: amountOre } }, `capture-${reference}`))
    },
    async cancel(reference) {
      await request('POST', `/epayment/v1/payments/${encodeURIComponent(reference)}/cancel`, undefined, `cancel-${reference}`)
    },
  }
}

// Local stand-in: every payment is approved at once, nothing leaves the machine.
export function mockVipps(): Vipps {
  const payments = new Map<string, PaymentInfo>()
  return {
    async createPayment({ reference, amountOre, returnUrl }) {
      payments.set(reference, { state: 'AUTHORIZED', authorizedOre: amountOre, capturedOre: 0 })
      return { redirectUrl: returnUrl }
    },
    async getPayment(reference) {
      const payment = payments.get(reference)
      if (!payment) throw new VippsError('Unknown mock payment.', 404, '')
      return { ...payment }
    },
    async capture(reference, amountOre) {
      const payment = payments.get(reference)
      if (!payment || payment.state !== 'AUTHORIZED') throw new VippsError('Mock payment is not authorized.', 400, '')
      payment.capturedOre = amountOre
      return { ...payment }
    },
    async cancel(reference) {
      const payment = payments.get(reference)
      if (payment) payment.state = 'TERMINATED'
    },
  }
}

/** Checks the HMAC signature Vipps puts on webhook requests. */
export function verifyWebhook(input: { secret: string; rawBody: string; pathAndQuery: string; host: string; headers: Headers }) {
  const date = input.headers.get('x-ms-date')
  const contentHash = input.headers.get('x-ms-content-sha256')
  const authorization = input.headers.get('authorization')
  if (!date || !contentHash || !authorization) return false
  if (createHash('sha256').update(input.rawBody).digest('base64') !== contentHash) return false
  const signed = `POST\n${input.pathAndQuery}\n${date};${input.host};${contentHash}`
  const signature = createHmac('sha256', input.secret).update(signed).digest('base64')
  const expected = Buffer.from(`HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=${signature}`)
  const actual = Buffer.from(authorization)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
