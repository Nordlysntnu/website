// Registers the adoption webhook with Vipps and prints its secret once.
// Run on the VM with the CMS env loaded: npm run vipps:webhook
// Put the printed secret in VIPPS_WEBHOOK_SECRET, then restart the CMS.
import { vippsConfig } from '../src/lib/vipps'

const config = vippsConfig()
if (!config || config.mode === 'mock') throw new Error('Set VIPPS_ENV to test or production and fill in the Vipps keys first.')
const cmsURL = process.env.CMS_URL
if (!cmsURL?.startsWith('https://')) throw new Error('CMS_URL must be the public https address of the CMS.')

const keys = { 'Ocp-Apim-Subscription-Key': config.subscriptionKey, 'Merchant-Serial-Number': config.msn }
const tokenResponse = await fetch(`${config.baseURL}/accesstoken/get`, {
  method: 'POST', headers: { client_id: config.clientId, client_secret: config.clientSecret, ...keys },
})
if (!tokenResponse.ok) throw new Error(`Access token failed: ${tokenResponse.status} ${await tokenResponse.text()}`)
const { access_token: token } = await tokenResponse.json()

const response = await fetch(`${config.baseURL}/webhooks/v1/webhooks`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...keys },
  body: JSON.stringify({
    url: `${cmsURL}/api/adopt/webhook`,
    events: ['authorized', 'aborted', 'expired', 'cancelled', 'captured', 'terminated'].map(event => `epayments.payment.${event}.v1`),
  }),
})
if (!response.ok) throw new Error(`Webhook registration failed: ${response.status} ${await response.text()}`)
const { id, secret } = await response.json()
console.log(`Webhook ${id} registered for ${cmsURL}/api/adopt/webhook (${config.mode}).`)
console.log(`VIPPS_WEBHOOK_SECRET=${secret}`)
