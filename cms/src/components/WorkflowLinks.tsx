import Link from 'next/link'

export function WorkflowLinks() {
  return <nav className="workflow-links" aria-label="Blog workflow">
    <Link href="/admin">← Editorial overview</Link>
    <Link href="/my-posts">My articles</Link>
    <Link href={'/admin/collections/posts?where[and][0][_status][equals]=draft&where[and][1][review][equals]=ready'}>Ready for review</Link>
    <Link href={'/admin/collections/posts?where[and][0][_status][equals]=draft&where[and][1][review][equals]=changes'}>Changes requested</Link>
    <Link href="/blog" target="_blank" rel="noreferrer">View local blog ↗</Link>
  </nav>
}
