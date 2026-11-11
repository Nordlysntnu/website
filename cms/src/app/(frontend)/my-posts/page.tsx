import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { editorialDate, reviewLabel } from '@/lib/editorial'
import { NotificationInbox } from '@/components/NotificationInbox'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'My articles · Nordlys CMS', robots: { index: false, follow: false } }
export default async function MyPosts({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || !['marketing', 'publisher', 'admin'].includes(user.role) || user.active === false) redirect('/admin/login')
  const rawPage = Number((await searchParams).page || '1')
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const posts = await payload.find({ collection: 'posts', user, overrideAccess: false, draft: true, depth: 0,
    where: { ownerId: { equals: user.id } }, limit: 20, page, sort: '-updatedAt' })
  return <main className="personal-main">
    <Link href="/admin">← Editorial overview</Link>
    <h1>My articles</h1><p>Your drafts, feedback and published stories. Public author names are separate from article ownership.</p>
    <p><Link href="/admin/collections/posts/create">Write an article →</Link></p>
    <NotificationInbox />
    <section aria-label="My articles"><h2>Your articles ({posts.totalDocs})</h2>
      {!posts.docs.length && <p>No articles here yet. Create an article to get started. Older demo drafts remain in the shared overview.</p>}
      <ul className="personal-posts">{posts.docs.map((post) => {
        const published = post._status === 'published'
        const status = published ? 'Published' : reviewLabel(post.review)
        const action = published ? 'View published article' : post.review === 'changes' ? 'Read feedback and revise' : post.review === 'ready' ? 'Waiting for review — view draft' : 'Continue writing'
        return <li key={post.id}><div className="personal-heading"><h3>{post.title}</h3><span className="personal-status">{status}</span></div>
          <p>{post.department || 'Team'} · Updated {editorialDate(post.updatedAt)}</p>
          <p>Reviewer: {post.reviewerName || 'Shared queue'}</p>
          {post.reviewNote && <blockquote><strong>{post.review === 'changes' ? 'Latest feedback' : 'Previous feedback'}</strong><p>{post.reviewNote}</p></blockquote>}
          <Link href={published ? '/blog/' + post.id : '/admin/collections/posts/' + post.id}>{action} →</Link>
          {published && <> · <Link href={'/admin/collections/posts/' + post.id}>Edit a new revision</Link></>}
        </li>
      })}</ul>
      <nav className="personal-pagination" aria-label="Article pages">{posts.hasPrevPage && <Link href={'/my-posts?page=' + (page - 1)}>← Previous</Link>}
        <span>Page {page} of {Math.max(1, posts.totalPages)}</span>{posts.hasNextPage && <Link href={'/my-posts?page=' + (page + 1)}>Next →</Link>}</nav>
    </section>
  </main>
}
