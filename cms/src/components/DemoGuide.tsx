import { publicationConfig } from '../publishing/config'
import { PublicationStatus } from './PublicationStatus'
import Link from 'next/link'
import type { ServerProps, Where } from 'payload'
import type { Post } from '../payload-types'
import { ArticleStarters } from './ArticleStarters'
import { editorialDate, reviewLabel } from '../lib/editorial'
import { NotificationInbox } from './NotificationInbox'

function Queue({ title, posts, empty, kind, total }: { title: string; posts: Post[]; empty: string; kind: string; total: number }) {
  return <section className="editorial-queue" aria-label={title}>
    <div className="editorial-section-heading"><h2>{title} <span className="editorial-count">{total}</span></h2></div>
    {posts.length ? <ul className="editorial-queue__list">{posts.map((post) => <li key={post.id}>
      <Link href={`/admin/collections/posts/${post.id}`} className="editorial-post-link">
        <span className="editorial-post-link__meta">{post.department || 'Team'} · {editorialDate(post.submittedAt || post.updatedAt)}</span>
        <strong>{post.title || 'Untitled article'}</strong>
        {kind === 'ready' && <span className="editorial-post-link__meta">Reviewer: {post.reviewerName || 'Shared queue'}{post.ownerName ? ` · Writer: ${post.ownerName}` : ''}</span>}
        <span className={`editorial-badge editorial-badge--${post.review || 'writing'}`}>{reviewLabel(post.review)}</span>
        {kind === 'changes' && post.reviewNote && <p className="editorial-note-excerpt">{post.reviewNote}</p>}
        <span className="editorial-post-link__action">{kind === 'ready' ? 'Open for review' : 'Continue writing'} →</span>
      </Link>
    </li>)}</ul> : <p className="editorial-empty">{empty}</p>}
    {total > posts.length && <Link className="editorial-link" href={`/admin/collections/posts?where[and][0][_status][equals]=draft&where[and][1][review][equals]=${kind}`}>View all {total} →</Link>}
  </section>
}

export async function DemoGuide({ payload, user }: ServerProps) {
  if (!user || !['marketing', 'publisher', 'admin'].includes(user.role) || user.active === false) return null
  const publisher = ['publisher', 'admin'].includes(user.role)
  const local = process.env.CMS_ENV !== 'production'
  const connected = publicationConfig().enabled
  const queue = (review: string) => payload.find({ collection: 'posts', overrideAccess: false, user, draft: true, depth: 0,
    where: { and: [{ _status: { equals: 'draft' } }, { review: { equals: review } }] }, limit: 4, sort: '-updatedAt' })
  const publishedWhere: Where = { _status: { equals: 'published' } }
  const [ready, changes, writing, published] = await Promise.all([
    queue('ready'), queue('changes'), queue('writing'),
    payload.find({ collection: 'posts', overrideAccess: false, user, draft: false, depth: 0, where: publishedWhere, limit: 1 }),
  ])
  const assigned = publisher ? await payload.find({ collection: 'posts', overrideAccess: false, user, draft: true, depth: 0,
    where: { and: [{ _status: { equals: 'draft' } }, { review: { equals: 'ready' } }, { reviewerId: { equals: user.id } }] },
    limit: 4, sort: '-updatedAt' }) : null
  return <div className="editorial-workspace">
    <section className="editorial-hero">
      <div><p className="editorial-eyebrow">NORDLYS · EDITORIAL WORKSPACE</p>
        <h1>{publisher ? 'Good stories, ready to share.' : 'Your next story starts here.'}</h1>
        <p>{publisher ? 'Review a draft, give useful feedback and publish when it is ready.' : 'Share what your group is building. Write a draft, preview it and send it to a publisher.'}</p>
        <div className="editorial-hero__links"><Link href="/admin/collections/posts/create">Write an article →</Link>
          <Link href="/my-posts">My articles →</Link>
          <Link href="/blog" target="_blank" rel="noreferrer">View CMS blog ↗</Link></div>
      </div><div className="editorial-environment"><span className="editorial-environment__dot" />{local ? 'Local test environment' : connected ? 'Website publishing connected' : 'Website connection pending'}<span>{local ? connected ? 'Publishing updates your local website preview. The public website is unchanged.' : 'Publishing here only updates this local CMS.' : connected ? 'Approved articles are built before the website is updated.' : 'Publication here does not yet update nordlysntnu.no.'}</span></div>
    </section>
    <nav className="editorial-stats" aria-label="Article status">
      {[{ label: 'Ready for review', count: ready.totalDocs, value: 'ready' }, { label: 'Changes requested', count: changes.totalDocs, value: 'changes' },
        { label: 'In progress', count: writing.totalDocs, value: 'writing' }].map((stat) => <Link key={stat.value}
          href={`/admin/collections/posts?where[and][0][_status][equals]=draft&where[and][1][review][equals]=${stat.value}`}>
          <strong>{stat.count}</strong><span>{stat.label}</span></Link>)}
      <Link href="/blog" target="_blank" rel="noreferrer"><strong>{published.totalDocs}</strong><span>Published in CMS ↗</span></Link>
    </nav>
    <NotificationInbox />
    <PublicationStatus />
    {assigned && <section className="editorial-queue" aria-label="Assigned to you">
      <h2>Assigned to you ({assigned.totalDocs})</h2>
      {assigned.docs.length ? <ul className="editorial-queue__list">{assigned.docs.map((post) => <li key={post.id}>
        <Link className="editorial-post-link" href={`/admin/collections/posts/${post.id}`}>{post.title} → Open for review</Link>
      </li>)}</ul> : <p className="editorial-empty">No review requests are assigned to you. You can also help from the shared queue below.</p>}
      {assigned.totalDocs > assigned.docs.length && <Link className="editorial-link" href={`/admin/collections/posts?where[and][0][_status][equals]=draft&where[and][1][review][equals]=ready&where[and][2][reviewerId][equals]=${user.id}`}>View all assigned requests →</Link>}
    </section>}
    <ArticleStarters />
    <div className="editorial-queues">
      <Queue title="Ready for review" posts={ready.docs} total={ready.totalDocs} kind="ready" empty="Nothing is waiting for review. New review requests will appear here." />
      <Queue title="Changes requested" posts={changes.docs} total={changes.totalDocs} kind="changes" empty="No drafts have been sent back. Feedback from a publisher will appear here." />
    </div>
    <Queue title="Continue writing" posts={writing.docs} total={writing.totalDocs} kind="writing" empty="No drafts in progress. Start a story above." />
    <aside className="editorial-how-it-works"><strong>Write → Preview → Review → Publish</strong>
      <p>{publisher ? 'You can publish or send a draft back with a note. Review the photos and factual details before publishing.' : 'Writers create drafts. A designated publisher reviews the content and publishes it; software does not need to approve every article.'} Drafts and review notes stay private.</p>
    </aside>
  </div>
}
