import { createHmac, timingSafeEqual } from 'node:crypto'

// Two-factor authentication policy. Production always requires an authenticator code
// per sign-in session. Local demos opt in with CMS_REQUIRE_2FA=true.
export function mfaRequired(env: Record<string, string | undefined> = process.env) {
  return env.CMS_ENV === 'production' || env.CMS_REQUIRE_2FA === 'true'
}

export type MfaAccount = {
  totpEnabledAt?: string | null
  mfaSessionIds?: unknown
  _sid?: string
} | null | undefined

/** True when this request's session has passed the second factor (or 2FA is not required). */
export function mfaSatisfied(user: MfaAccount) {
  if (!mfaRequired()) return true
  if (!user?.totpEnabledAt || !user._sid) return false
  return Array.isArray(user.mfaSessionIds) && user.mfaSessionIds.includes(user._sid)
}

// Remembered browsers. After a correct code a member can let this browser skip the code for
// TRUSTED_BROWSER_DAYS; the password is still needed. The cookie is signed with the CMS secret
// and tied to the account, its role and when its authenticator was set up, so resetting 2FA or
// changing the role ends the trust in every browser.
export const TRUSTED_BROWSER_COOKIE = 'nordlys-cms-trusted-browser'
export const TRUSTED_BROWSER_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

export type TrustAccount = { id: number | string; role?: string | null; totpEnabledAt?: string | Date | null }

function trustSignature(account: TrustAccount, expires: number, secret: string) {
  const enrolled = account.totpEnabledAt ? new Date(account.totpEnabledAt).toISOString() : ''
  return createHmac('sha256', secret)
    .update(['trusted-browser-v1', account.id, account.role ?? '', enrolled, expires].join('\n'))
    .digest('base64url')
}

const cookieAttributes = (secure: boolean) => `Path=/; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`

/** Set-Cookie value that remembers this browser for the account. */
export function trustedBrowserCookie(account: TrustAccount, secret: string, secure: boolean, now = Date.now()) {
  const expires = now + TRUSTED_BROWSER_DAYS * DAY_MS
  const value = `v1.${account.id}.${expires}.${trustSignature(account, expires, secret)}`
  return `${TRUSTED_BROWSER_COOKIE}=${value}; Max-Age=${TRUSTED_BROWSER_DAYS * 24 * 60 * 60}; ${cookieAttributes(secure)}`
}

/** Set-Cookie value that makes this browser forget the trust. */
export const forgetBrowserCookie = (secure: boolean) => `${TRUSTED_BROWSER_COOKIE}=; Max-Age=0; ${cookieAttributes(secure)}`

/** True when the request's cookies show that this browser is remembered for the account. */
export function isTrustedBrowser(cookieHeader: string | null | undefined, account: TrustAccount | null | undefined, secret: string, now = Date.now()) {
  if (!account?.totpEnabledAt || !cookieHeader) return false
  const value = cookieHeader.split(';').map(part => part.trim())
    .find(part => part.startsWith(TRUSTED_BROWSER_COOKIE + '='))?.slice(TRUSTED_BROWSER_COOKIE.length + 1)
  const match = /^v1\.(\d+)\.(\d+)\.([\w-]+)$/.exec(value ?? '')
  if (!match || match[1] !== String(account.id)) return false
  const expires = Number(match[2])
  if (expires <= now || expires > now + TRUSTED_BROWSER_DAYS * DAY_MS + 60_000) return false
  const expected = Buffer.from(trustSignature(account, expires, secret))
  const given = Buffer.from(match[3])
  return expected.length === given.length && timingSafeEqual(expected, given)
}

/** The session id inside a Payload token that was just issued. */
export function sessionIdOf(token: string | undefined) {
  try {
    const sid = JSON.parse(Buffer.from(String(token).split('.')[1], 'base64url').toString()).sid
    return typeof sid === 'string' ? sid : null
  } catch { return null }
}

/** Session ids that have passed the second factor, keeping only sessions that still exist. */
export function verifiedSessions(user: { sessions?: { id: string }[] | null; mfaSessionIds?: unknown }, add: string) {
  const live = new Set((user.sessions || []).map(session => session.id))
  const previous = Array.isArray(user.mfaSessionIds) ? user.mfaSessionIds.filter((id): id is string => typeof id === 'string' && live.has(id)) : []
  return [...new Set([...previous, add])]
}
