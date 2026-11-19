'use client'
import { useAuth } from '@payloadcms/ui'
import { useEffect, useState, type ReactNode } from 'react'

type Status = { signedIn: boolean; required: boolean; enabled?: boolean; verified?: boolean }
type Setup = { secret: string; qr: string; uri: string }

const errorText = async (response: Response, fallback: string) => {
  try { return (await response.json()).errors?.[0]?.message || fallback } catch { return fallback }
}

/** Blocks the admin UI until the current session has passed the authenticator-code check. */
export function TwoFactorGate({ children }: { children?: ReactNode }) {
  const { user } = useAuth()
  const [status, setStatus] = useState<Status | null>(null)
  const [setup, setSetup] = useState<Setup | null>(null)
  const [code, setCode] = useState('')
  const [remember, setRemember] = useState(true)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) { setStatus(null); return }
    let cancelled = false
    fetch('/api/users/2fa/status', { credentials: 'same-origin', cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(result => { if (!cancelled) setStatus(result) })
      .catch(() => { if (!cancelled) setStatus(null) })
    return () => { cancelled = true }
  }, [user])

  if (!user || !status?.signedIn || !status.required || status.verified) return <>{children}</>

  const startSetup = async () => {
    setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/users/2fa/setup', { method: 'POST', credentials: 'same-origin' })
      if (!response.ok) throw new Error(await errorText(response, 'Could not start setup.'))
      setSetup(await response.json())
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not start setup.') }
    finally { setBusy(false) }
  }

  return <div className="two-factor-gate" role="dialog" aria-modal="true" aria-labelledby="two-factor-title">
    <section className="two-factor-gate__card">
      <h1 id="two-factor-title">Two-factor sign-in</h1>
      {!status.enabled && !setup && <>
        <p>Nordlys CMS needs a code from an authenticator app (for example Google Authenticator, Microsoft Authenticator, 1Password or Bitwarden) when you sign in. You can let a browser remember the code for 30 days.</p>
        <button type="button" onClick={startSetup} disabled={busy}>{busy ? 'Preparing…' : 'Set up authenticator'}</button>
      </>}
      {setup && <>
        <p>Scan this code with your authenticator app, then enter the six-digit code it shows.</p>
        <div className="two-factor-gate__qr" dangerouslySetInnerHTML={{ __html: setup.qr }} />
        <details><summary>Can't scan? Enter the key manually</summary>
          <code className="two-factor-gate__secret">{setup.secret.match(/.{1,4}/g)?.join(' ')}</code>
        </details>
      </>}
      {(status.enabled || setup) && <form onSubmit={async (event) => {
        event.preventDefault(); setBusy(true); setMessage('')
        try {
          const response = await fetch('/api/users/2fa/verify', { method: 'POST', credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, remember }) })
          if (!response.ok) throw new Error(await errorText(response, 'That code is not valid.'))
          window.location.reload()
        } catch (error) { setMessage(error instanceof Error ? error.message : 'That code is not valid.'); setCode('') }
        finally { setBusy(false) }
      }}>
        <label>Authenticator code
          <input name="code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" required autoFocus />
        </label>
        <button type="submit" disabled={busy || code.length !== 6}>{busy ? 'Checking…' : 'Verify'}</button>
        <label className="two-factor-gate__remember">
          <input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} />
          <span>Remember this browser for 30 days. Leave this off on a shared computer.</span>
        </label>
      </form>}
      <p role="status" className="two-factor-gate__message">{message}</p>
      <p className="two-factor-gate__help">Lost your phone? Ask a CMS administrator to reset two-factor sign-in. <a href="/admin/logout">Sign out</a></p>
    </section>
  </div>
}
