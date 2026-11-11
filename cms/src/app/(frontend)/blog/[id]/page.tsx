import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PostArticle } from '@/components/PostArticle'
import { BlogCard } from '@/components/BlogIndex'
import { readPublishedPost } from '@/lib/published-post'
import { excerpt } from '@/lib/blog'

export const dynamic = 'force-dynamic'
type Args = { params: Promise<{ id: string }> }
export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const post = await readPublishedPost((await params).id)
  return { title: post ? `${post.title} | Nordlys NTNU` : 'Article not found | Nordlys NTNU', description: post ? excerpt(post) : undefined }
}
export default async function Article({ params }: Args) {
  const post = await readPublishedPost((await params).id)
  if (!post) notFound()
  const payload = await getPayload({ config })
  const more = await payload.find({ collection: 'posts', overrideAccess: false, draft: false, depth: 2,
    where: { and: [{ _status: { equals: 'published' } }, { id: { not_equals: post.id } }] }, sort: '-publishedAt', limit: 3 })
  return <main className="article-main"><PostArticle post={post} />
    {more.docs.length > 0 && <section className="article-related"><h2>More from Nordlys</h2>
      <div className="blog-grid">{more.docs.map((item) => <BlogCard post={item} key={item.id} />)}</div></section>}
  </main>
}
