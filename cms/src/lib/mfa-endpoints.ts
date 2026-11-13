import QRCode from 'qrcode'
import { APIError, type Endpoint, type PayloadRequest } from 'payload'
import { isAdministrator, isSignedInMember } from '../access'
import { forgetBrowserCookie, mfaRequired, mfaSatisfied, trustedBrowserCookie, verifiedSessions } from './mfa'
import { generateTotpSecret, openSecret, otpauthURI, sealSecret, verifyTotp } from './totp'

type MfaUser = {
  id: number; email: string; role?: string; active?: boolean | null; _sid?: string
  sessions?: { id: string }[] | null; totpEnabledAt?: string | null; totpSecret?: string | null
  totpPendingSecret?: string | null; totpLastStep?: number | null; totpFailures?: number | null
  totpLockedUntil?: string | null; mfaSessionIds?: unknown
}
const MAX_FAILURES = 5
const LOCK_MS = 5 * 60 * 1000
const noStore = { 'Cache-Control': 'no-store' }

function member(req: PayloadRequest) {
  const user = req.user as unknown as MfaUser | null
  if (!user || !isSignedInMember(user as never) || !user._sid) throw new APIError('Sign in first.', 401)
  return user
}
const save = (req: PayloadRequest, id: number, data: Record<string, unknown>) =>
  req.payload.update({ collection: 'users', id, data: data as never, overrideAccess: true, req, context: { mfa: true } })

export const mfaEndpoints: Endpoint[] = [
  { path: '/2fa/status', method: 'get', handler: async (req) => {
    const user = req.user as unknown as MfaUser | null
    if (!user || !isSignedInMember(user as never)) return Response.json({ signedIn: false, required: mfaRequired() }, { headers: noStore })
    return Response.json({ signedIn: true, required: mfaRequired(), enabled: !!user.totpEnabledAt,
      verified: mfaSatisfied(user), pending: !user.totpEnabledAt && !!user.totpPendingSecret }, { headers: noStore })
  } },

  { path: '/2fa/setup', method: 'post', handler: async (req) => {
    const user = member(req)
    // An enrolled factor can only be replaced after an administrator reset (or the offline reset script),
    // so a stolen password alone cannot enrol a new device.
    if (user.totpEnabledAt) throw new APIError('Two-factor authentication is already set up. Ask an administrator to reset it.', 409)
    const secret = generateTotpSecret()
    await save(req, user.id, { totpPendingSecret: sealSecret(secret, req.payload.secret), totpFailures: 0 })
    const uri = otpauthURI(secret, user.email)
    const qr = await QRCode.toString(uri, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })
    return Response.json({ secret, uri, qr }, { headers: noStore })
  } },

  { path: '/2fa/verify', method: 'post', handler: async (req) => {
    const user = member(req)
    const body = await req.json!().catch(() => ({}))
    if (user.totpLockedUntil && Date.parse(user.totpLockedUntil) > Date.now()) {
      throw new APIError('Too many wrong codes. Wait five minutes and try again.', 429)
    }
    const sealed = user.totpEnabledAt ? user.totpSecret : user.totpPendingSecret
    if (!sealed) throw new APIError('Start two-factor setup first.', 400)
    const step = verifyTotp(openSecret(sealed, req.payload.secret), String(body?.code ?? ''))
    if (step === null || step <= (user.totpLastStep ?? -1)) {
      const failures = (user.totpFailures ?? 0) + 1
      await save(req, user.id, failures >= MAX_FAILURES
        ? { totpFailures: 0, totpLockedUntil: new Date(Date.now() + LOCK_MS).toISOString() }
        : { totpFailures: failures })
      throw new APIError('That code is not valid. Check the time on your phone and use a new code.', 400)
    }
    const totpEnabledAt = user.totpEnabledAt || new Date().toISOString()
    await save(req, user.id, {
      ...(user.totpEnabledAt ? {} : { totpSecret: user.totpPendingSecret, totpPendingSecret: null, totpEnabledAt }),
      totpLastStep: step, totpFailures: 0, totpLockedUntil: null, mfaSessionIds: verifiedSessions(user, user._sid!),
    })
    // "Remember this browser" lets the next sign-ins here skip the code; unticking it forgets the browser.
    const secure = process.env.CMS_ENV === 'production'
    const cookie = body?.remember === true
      ? trustedBrowserCookie({ id: user.id, role: user.role, totpEnabledAt }, req.payload.secret, secure)
      : forgetBrowserCookie(secure)
    return Response.json({ message: 'Two-factor authentication verified.' }, { headers: { ...noStore, 'Set-Cookie': cookie } })
  } },

  { path: '/2fa/reset', method: 'post', handler: async (req) => {
    if (!isAdministrator(req.user)) throw new APIError('Only administrators can reset two-factor authentication.', 403)
    const body = await req.json!().catch(() => ({}))
    const id = Number(body?.id)
    if (!Number.isSafeInteger(id) || id <= 0) throw new APIError('Choose an account.', 400)
    await save(req, id, { totpSecret: null, totpPendingSecret: null, totpEnabledAt: null, totpLastStep: null,
      totpFailures: 0, totpLockedUntil: null, mfaSessionIds: [], sessions: [] })
    return Response.json({ message: 'Two-factor authentication was reset. The member sets it up again at next sign-in.' }, { headers: noStore })
  } },
]
