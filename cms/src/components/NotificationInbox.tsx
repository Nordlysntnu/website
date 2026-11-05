'use client'
import { useEffect, useState } from 'react'
import type { NotificationItem } from '../lib/notifications'

export function NotificationInbox() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [readAt, setReadAt] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    async function refresh() {
      try {
        const response = await fetch('/api/users/notifications', { cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw new Error('Could not load notifications')
        const result = await response.json()
        setItems(result.items)
        setReadAt((current) => current && (!result.readAt || current > result.readAt) ? current : result.readAt)
        setLoaded(true); setError('')
      } catch { if (!controller.signal.aborted) setError('Could not load notifications. Please reload or try again shortly.') }
    }
    void refresh()
    const timer = setInterval(() => { if (document.visibilityState === 'visible') void refresh() }, 30000)
    return () => { controller.abort(); clearInterval(timer) }
  }, [])
  const unread = items.filter((item) => !readAt || item.at > readAt)
  async function markRead() {
    if (!items.length || saving) return
    setSaving(true)
    try {
      const response = await fetch('/api/users/read-notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ through: items[0].at }) })
      if (!response.ok) throw new Error('Could not mark notifications as read')
      setReadAt((await response.json()).readAt); setError('')
    } catch { setError('Could not mark notifications as read. Please try again.') }
    finally { setSaving(false) }
  }
  return <section className="personal-notifications" aria-label="Notifications">
    <div className="personal-heading"><h2>Notifications {loaded && <span>({unread.length} unread)</span>}</h2>
      <button type="button" disabled={!unread.length || saving} onClick={() => void markRead()}>Mark all as read</button></div>
    {!loaded && !error && <p>Loading notifications…</p>}
    {loaded && !items.length && <p>No notifications yet. Review requests, feedback and publishing updates will appear here.</p>}
    <ul>{items.slice(0, 12).map((item) => <li key={item.id} className={!readAt || item.at > readAt ? 'notification-unread' : ''}>
      <a href={'/admin/collections/posts/' + item.postID}><strong>{item.message}</strong><span>{item.title}</span>
        <time dateTime={item.at}>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Oslo' }).format(new Date(item.at))} · Oslo</time></a>
    </li>)}</ul>
    {items.length > 12 && <p>Showing the latest 12 notifications.</p>}
    {error && <p role="alert">{error}</p>}
  </section>
}
