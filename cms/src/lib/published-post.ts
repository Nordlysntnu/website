import { cache } from 'react'
import config from '@payload-config'
import { getPayload } from 'payload'

export const readPublishedPost = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) return null
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'posts', overrideAccess: false, draft: false, depth: 2,
    where: { and: [{ id: { equals: Number(id) } }, { _status: { equals: 'published' } }] }, limit: 1 })
  return result.docs[0] || null
})
