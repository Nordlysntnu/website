import config from '@payload-config'
import { getPayload } from 'payload'
import { BlogIndex } from '@/components/BlogIndex'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Blog | Nordlys NTNU' }
export default async function Blog() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts', overrideAccess: false, draft: false, depth: 2,
    where: { _status: { equals: 'published' } }, sort: '-publishedAt', pagination: false,
  })
  return <main className="blog-main">
    <div className="blog-intro"><p className="demo-eyebrow">THE NORDLYS JOURNEY</p><h1>Stories from<br /><span>the team.</span></h1>
      <p>From the workshop to the racetrack. Follow the people, ideas and milestones behind Nordlys.</p></div>
    <BlogIndex posts={posts.docs} />
  </main>
}
