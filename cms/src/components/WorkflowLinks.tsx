'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const posts = '/admin/collections/posts'
const draftsIn = (review: string) => `${posts}?where[and][0][_status][equals]=draft&where[and][1][review][equals]=${review}`

/** Tab bar above the blog post list: quick filters for the editorial workflow. */
export function WorkflowLinks() {
  const params = useSearchParams()
  const review = params.get('where[and][1][review][equals]')
  const filtered = [...params.keys()].some(key => key.startsWith('where'))
  const tabs = [
    { label: 'All articles', href: posts, active: !filtered },
    { label: 'Ready for review', href: draftsIn('ready'), active: review === 'ready' },
    { label: 'Changes requested', href: draftsIn('changes'), active: review === 'changes' },
  ]
  return <nav className="workflow-links" aria-label="Blog workflow">
    <Link className="workflow-links__back" href="/admin">← Overview</Link>
    <div className="workflow-links__tabs">
      {tabs.map(tab => <Link key={tab.label} href={tab.href} className="workflow-links__tab"
        aria-current={tab.active ? 'page' : undefined}>{tab.label}</Link>)}
      <Link href="/my-posts" className="workflow-links__tab">My articles</Link>
    </div>
    <Link className="workflow-links__external" href="/blog" target="_blank" rel="noreferrer">View published blog ↗</Link>
  </nav>
}
