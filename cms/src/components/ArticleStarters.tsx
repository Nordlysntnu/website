'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useConfig } from '@payloadcms/ui'
import { articleStarters, starterData } from '../lib/article-starters'

export function ArticleStarters() {
  const router = useRouter()
  const { config: { routes: { api } } } = useConfig()
  const [creating, setCreating] = useState<string | null>(null)
  const [error, setError] = useState('')
  async function start(id: string) {
    if (creating) return
    setCreating(id)
    setError('')
    try {
      const response = await fetch(`${api}/posts?draft=true&depth=0`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(starterData(id)),
      })
      if (!response.ok) throw new Error('Could not create the draft. Please try again.')
      const { doc } = await response.json()
      if (!doc?.id) throw new Error('The draft could not be opened. Check Blog posts before trying again.')
      router.push(`/admin/collections/posts/${doc.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the draft.')
      setCreating(null)
    }
  }
  return <section className="article-starters" aria-labelledby="starters-title">
    <div className="editorial-section-heading"><div><h2 id="starters-title">Start a story</h2><p>A little structure to get past the blank page.</p></div>
      <a className="editorial-link" href="/admin/collections/posts/create">Start from scratch →</a></div>
    <div className="article-starters__grid">{articleStarters.map((starter) => <button type="button" key={starter.id}
      className="article-starter" disabled={Boolean(creating)} aria-busy={creating === starter.id} onClick={() => void start(starter.id)}>
      <span className="article-starter__name">{creating === starter.id ? 'Creating draft…' : starter.name}<span aria-hidden="true">↗</span></span>
      <span>{starter.description}</span><small>Create a private draft</small>
    </button>)}</div>
    {error && <p className="review-action__error" role="alert">{error}</p>}
  </section>
}
