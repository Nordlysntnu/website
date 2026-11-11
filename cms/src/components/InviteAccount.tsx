'use client'
import { useState } from 'react'
import { useAuth } from '@payloadcms/ui'

export function InviteAccount() {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)
  if (user?.role !== 'admin') return null
  return <section className="account-invite">
    <h2>Invite a member</h2>
    <p>The member receives a link to choose their own password. Links expire after one hour.</p>
    <form onSubmit={async (event) => {
      event.preventDefault(); setBusy(true); setMessage(''); setLink('')
      const form = event.currentTarget
      const data = new FormData(form)
      try {
        const response = await fetch('/api/users/invite', { method: 'POST', credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(data)) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.errors?.[0]?.message || 'Could not send the invitation.')
        setMessage(result.message); setLink(result.setupLink || ''); form.reset()
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not send the invitation.') }
      finally { setBusy(false) }
    }}>
      <label>Name<input name="name" required maxLength={100} autoComplete="name" /></label>
      <label>Email<input name="email" type="email" required autoComplete="email" /></label>
      <label>Role<select name="role" defaultValue="marketing">
        <option value="marketing">Writer</option><option value="publisher">Publisher</option><option value="admin">Administrator</option>
      </select></label>
      <button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send invitation'}</button>
    </form>
    <p role="status">{message}</p>
    {link && <p><input readOnly value={link} aria-label="Password setup link" onFocus={event => event.currentTarget.select()} style={{ width: '100%' }} /></p>}
    <p>To resend a link, use the member's account page. In local mode, email is saved to the private local outbox.</p>
  </section>
}
