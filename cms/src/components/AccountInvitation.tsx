'use client'
import { useAuth, useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'
export function AccountInvitation() {
  const { user } = useAuth()
  const { id } = useDocumentInfo()
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)
  if (user?.role !== 'admin' || !id) return null
  return <div className="account-invitation">
    <button type="button" disabled={busy} onClick={async () => {
      setBusy(true); setMessage(''); setLink('')
      try {
        const response = await fetch('/api/users/resend-invitation', { method: 'POST',
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: Number(id) }) })
        const result = await response.json()
        setMessage(response.ok ? result.message : result.errors?.[0]?.message || 'Could not send the email.')
        if (response.ok && result.setupLink) setLink(result.setupLink)
      } catch { setMessage('Could not send the email. Try again.') }
      finally { setBusy(false) }
    }}>{busy ? 'Sending…' : 'Resend password setup email'}</button>
    <p role="status">{message}</p>
    {link && <input readOnly value={link} aria-label="Password setup link" onFocus={event => event.currentTarget.select()} style={{ width: '100%' }} />}
  </div>
}
