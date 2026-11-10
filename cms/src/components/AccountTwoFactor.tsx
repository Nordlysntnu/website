'use client'
import { useAuth, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useState } from 'react'

/** Administrator control on an account page: reset a member's authenticator (for a lost phone). */
export function AccountTwoFactor() {
  const { user } = useAuth()
  const { id } = useDocumentInfo()
  const enabledAt = useFormFields(([fields]) => fields.totpEnabledAt?.value)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  if (user?.role !== 'admin' || !id) return null
  return <div className="account-invitation account-two-factor">
    <p>Two-factor sign-in: <strong>{enabledAt ? 'set up' : 'not set up yet'}</strong></p>
    {enabledAt ? <button type="button" disabled={busy} onClick={async () => {
      if (!window.confirm('Reset two-factor sign-in for this account? The member is signed out and must set up a new authenticator.')) return
      setBusy(true); setMessage('')
      try {
        const response = await fetch('/api/users/2fa/reset', { method: 'POST', credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: Number(id) }) })
        const result = await response.json()
        setMessage(response.ok ? result.message : result.errors?.[0]?.message || 'Could not reset two-factor sign-in.')
        if (response.ok && Number(id) === Number(user.id)) window.location.href = '/admin/login'
      } catch { setMessage('Could not reset two-factor sign-in. Try again.') }
      finally { setBusy(false) }
    }}>{busy ? 'Resetting…' : 'Reset two-factor sign-in'}</button> : null}
    <p role="status">{message}</p>
  </div>
}
