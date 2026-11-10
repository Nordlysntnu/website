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
