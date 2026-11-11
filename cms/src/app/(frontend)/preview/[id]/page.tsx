import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'
import { LivePost } from '@/components/LivePost'
import type { Post } from '@/payload-types'

export const dynamic = 'force-dynamic'
export default async function Preview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || !['marketing', 'publisher', 'admin'].includes(user.role) || user.active === false) redirect('/admin/login')
  let post: Post
  if (id === 'new') {
    post = { id: 0, title: 'New post', publishedAt: new Date().toISOString(), imageFit: 'contain',
      review: 'writing', _status: 'draft', gallery: [], content: { root: { type: 'root', children: [],
        direction: 'ltr', format: '', indent: 0, version: 1 } }, createdAt: '', updatedAt: '' }
  } else {
    if (!/^\d+$/.test(id)) notFound()
    const result = await payload.find({ collection: 'posts', where: { id: { equals: Number(id) } },
      draft: true, depth: 2, limit: 1, user, overrideAccess: false })
    if (!result.docs[0]) notFound()
    post = result.docs[0]
  }
  return <main className="article-main">
    <div className="demo-preview-note">Draft preview · Only signed-in editors can open this page</div>
    <LivePost initialData={post} serverURL={process.env.CMS_URL || 'http://127.0.0.1:3010'} />
  </main>
}
