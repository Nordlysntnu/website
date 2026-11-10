import assert from 'node:assert/strict'
import { test } from 'node:test'
import { randomUUID, randomBytes } from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { getPayload, handleEndpoints } from 'payload'
import { base32Decode, base32Encode, currentStep, openSecret, sealSecret, totpCode, verifyTotp } from '../src/lib/totp'

const dataDir = path.resolve('.local/tests/mfa-' + randomUUID())
await mkdir(dataDir, { recursive: true, mode: 0o700 })
const databaseFile = path.join(dataDir, 'cms.db')
Object.assign(process.env, {
  CMS_ENV: 'local', CMS_URL: 'http://127.0.0.1:3010', NODE_ENV: 'test', CMS_REQUIRE_2FA: 'true',
  PAYLOAD_SECRET: randomBytes(48).toString('hex'), CMS_DATA_DIR: dataDir,
  DATABASE_URL: 'file:' + databaseFile.replaceAll('\\', '/'), CMS_SCHEMA_PUSH: 'false',
})
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })
payload.logger.level = 'fatal'
const base = 'http://127.0.0.1:3010'
async function request(url: string, token?: string, method = 'GET', body?: unknown) {
  const headers: Record<string, string> = { Origin: base }
  if (token) headers.Authorization = 'JWT ' + token
  if (body) headers['Content-Type'] = 'application/json'
  return handleEndpoints({ config, path: new URL(url, base).pathname, request: new Request(base + url,
    { method, headers, body: body ? JSON.stringify(body) : undefined }) })
}
const password = 'A long disposable test password ' + randomUUID()
async function login(email: string) {
  const response = await request('/api/users/login', undefined, 'POST', { email, password })
  assert.equal(response.status, 200, await response.clone().text())
  const body = await response.json()
  for (const field of ['totpSecret', 'totpPendingSecret', 'totpLastStep', 'totpFailures', 'totpLockedUntil', 'mfaSessionIds']) {
    assert.ok(!(field in body.user), 'login response must not expose ' + field)
  }
  return body.token as string
}
async function account(role: 'marketing' | 'publisher' | 'admin', name: string) {
  const doc = await payload.create({ collection: 'users', overrideAccess: true, context: { accountProvisioning: true },
    data: { name, email: randomUUID() + '@example.test', password, role, active: true } })
  return { ...doc, token: await login(doc.email) }
}
const content = { root: { type: 'root', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0,
  children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Two-factor test article.',
    detail: 0, format: 0, mode: 'normal', style: '' }] }] } }
const newPost = (token: string) => request('/api/posts', token, 'POST', { title: 'MFA ' + randomUUID(), content })
const errorOf = async (response: Response) => (await response.json()).errors?.[0]?.message as string

test('TOTP primitives follow RFC 6238', () => {
  // RFC 6238 appendix B, SHA-1 seed "12345678901234567890", T = 59 s → 94287082 (last 6 digits 287082).
  const secret = base32Encode(Buffer.from('12345678901234567890'))
  assert.equal(base32Decode(secret).toString(), '12345678901234567890')
  assert.equal(totpCode(secret, Math.floor(59 / 30)), '287082')
  assert.equal(verifyTotp(secret, '287082', 59_000), 1)
  assert.equal(verifyTotp(secret, '287083', 59_000), null)
  assert.equal(verifyTotp(secret, 'abc', 59_000), null)
  const sealed = sealSecret(secret, 'app secret')
  assert.ok(!sealed.includes(secret))
  assert.equal(openSecret(sealed, 'app secret'), secret)
  assert.throws(() => openSecret(sealed, 'another secret'))
})

test('two-factor sign-in through real Payload REST handlers', async (t) => {
  try {
    await payload.db.migrate()
    const admin = await account('admin', 'MFA administrator')
    const writer = await account('marketing', 'MFA writer')
    let secret = ''

    await t.test('a password-only session cannot read or write content', async () => {
      assert.equal((await newPost(writer.token)).status, 403)
      const status = await (await request('/api/users/2fa/status', writer.token)).json()
      assert.deepEqual(status, { signedIn: true, required: true, enabled: false, verified: false, pending: false })
      const me = await (await request('/api/users/me', writer.token)).json()
      assert.equal(me.user?.id, writer.id, 'members can load their own account so the 2FA screen works')
      const notifications = await request('/api/users/notifications', writer.token)
      assert.equal(notifications.status, 403)
      const accounts = await (await request('/api/users', admin.token)).json()
      assert.equal(accounts.totalDocs, 1, 'an unverified administrator only sees their own account')
      assert.equal((await request('/api/users/2fa/reset', admin.token, 'POST', { id: writer.id })).status, 403)
    })

    await t.test('setup stores an encrypted secret that is never returned by the API', async () => {
      const response = await request('/api/users/2fa/setup', writer.token, 'POST')
      assert.equal(response.status, 200, await response.clone().text())
      const body = await response.json()
      secret = body.secret
      assert.match(secret, /^[A-Z2-7]{32}$/)
      assert.match(body.uri, /^otpauth:\/\/totp\//)
      assert.match(body.qr, /^<svg/)
      const me = JSON.stringify(await (await request('/api/users/me', writer.token)).json())
      assert.ok(!me.includes(secret) && !me.includes('totpPendingSecret') && !me.includes('mfaSessionIds'))
      const db = new DatabaseSync(databaseFile)
      try {
        const row = db.prepare('SELECT totp_pending_secret AS pending FROM users WHERE id = ?').get(writer.id) as { pending: string }
        assert.match(row.pending, /^v1\./)
        assert.ok(!row.pending.includes(secret))
      } finally { db.close() }
    })

    await t.test('wrong codes are rejected; the right code unlocks this session', async () => {
      const wrong = String((Number(totpCode(secret, currentStep())) + 1) % 1_000_000).padStart(6, '0')
      const rejected = await request('/api/users/2fa/verify', writer.token, 'POST', { code: wrong })
      assert.equal(rejected.status, 400)
      const accepted = await request('/api/users/2fa/verify', writer.token, 'POST', { code: totpCode(secret, currentStep()) })
      assert.equal(accepted.status, 200, await accepted.clone().text())
      assert.equal((await newPost(writer.token)).status, 201)
      const status = await (await request('/api/users/2fa/status', writer.token)).json()
      assert.equal(status.enabled && status.verified, true)
      assert.equal((await request('/api/users/2fa/setup', writer.token, 'POST')).status, 409, 'an enrolled factor cannot be replaced by the member')
    })

    await t.test('each new sign-in needs a fresh code, and codes cannot be replayed', async () => {
      const second = await login(writer.email)
      assert.equal((await newPost(second)).status, 403)
      const replay = await request('/api/users/2fa/verify', second, 'POST', { code: totpCode(secret, currentStep()) })
      assert.equal(replay.status, 400, 'the code already used in this time window is refused')
      const next = await request('/api/users/2fa/verify', second, 'POST', { code: totpCode(secret, currentStep() + 1) })
      assert.equal(next.status, 200, await next.clone().text())
      assert.equal((await newPost(second)).status, 201)
      assert.equal((await newPost(writer.token)).status, 201, 'the earlier verified session stays verified')
    })

    await t.test('five wrong codes lock verification for five minutes', async () => {
      const third = await login(writer.email)
      for (let attempt = 0; attempt < 5; attempt++) {
        assert.equal((await request('/api/users/2fa/verify', third, 'POST', { code: '000000' })).status, 400)
      }
      const locked = await request('/api/users/2fa/verify', third, 'POST', { code: totpCode(secret, currentStep() + 1) })
      assert.equal(locked.status, 429)
      assert.match(await errorOf(locked), /Wait five minutes/)
    })

    await t.test('a verified administrator can reset a lost authenticator', async () => {
      const setup = await (await request('/api/users/2fa/setup', admin.token, 'POST')).json()
      const verified = await request('/api/users/2fa/verify', admin.token, 'POST', { code: totpCode(setup.secret, currentStep()) })
      assert.equal(verified.status, 200, await verified.clone().text())
      const reset = await request('/api/users/2fa/reset', admin.token, 'POST', { id: writer.id })
      assert.equal(reset.status, 200, await reset.clone().text())
      assert.equal((await request('/api/users/me', writer.token)).status, 200)
      assert.equal((await (await request('/api/users/me', writer.token)).json()).user, null, 'the member was signed out everywhere')
      const fresh = await login(writer.email)
      const status = await (await request('/api/users/2fa/status', fresh)).json()
      assert.equal(status.enabled, false)
      assert.equal((await request('/api/users/2fa/setup', fresh, 'POST')).status, 200)
    })

    await t.test('without a mail relay, invitations return a one-time setup link to the administrator', async () => {
      process.env.CMS_EMAIL_MODE = 'manual'
      try {
        const email = randomUUID() + '@example.test'
        const response = await request('/api/users/invite', admin.token, 'POST', { name: 'Manual invite', email, role: 'marketing' })
        assert.equal(response.status, 201, await response.clone().text())
        const body = await response.json()
        assert.match(body.setupLink, /^http:\/\/127\.0\.0\.1:3010\/admin\/reset\/.+/)
        const token = decodeURIComponent(new URL(body.setupLink).pathname.split('/').pop()!)
        const accepted = await request('/api/users/reset-password', undefined, 'POST', { token, password })
        assert.equal(accepted.status, 200, await accepted.clone().text())
      } finally { delete process.env.CMS_EMAIL_MODE }
    })
  } finally { await payload.destroy() }
})
