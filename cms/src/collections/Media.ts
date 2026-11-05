import path from 'node:path'
import type { Access, CollectionConfig, PayloadRequest, Where } from 'payload'
import { editorsOnly, isEditor, isPublisher } from '../access'
import { postPhotoIDs } from '../lib/blog'
import { cmsRuntime } from '../lib/runtime'

async function publishedPhotoIDs(req: PayloadRequest) {
  const posts = await req.payload.find({ collection: 'posts', where: { _status: { equals: 'published' } },
    draft: false, depth: 0, pagination: false, overrideAccess: true, req })
  return [...new Set(posts.docs.flatMap(postPhotoIDs))]
}
const visibleMedia: Access = async ({ req }) => {
  if (isPublisher(req.user)) return true
  const ids = await publishedPhotoIDs(req)
  const publicPhotos: Where = { id: { in: ids } }
  return isEditor(req) ? { or: [publicPhotos, { ownerId: { equals: req.user!.id } }] } : publicPhotos
}
const editableMedia: Access = async ({ req }) => {
  if (isPublisher(req.user)) return true
  if (!isEditor(req)) return false
  const ids = await publishedPhotoIDs(req)
  const where: Where = { and: [{ ownerId: { equals: req.user!.id } }, { id: { not_in: ids } }] }
  return where
}
const deletableMedia: Access = async ({ req }) => {
  if (!isPublisher(req.user)) return false
  const ids = await publishedPhotoIDs(req)
  return { id: { not_in: ids } }
}
export const Media: CollectionConfig = {
  slug: 'media', labels: { singular: 'Photo', plural: 'Photos' },
  admin: { useAsTitle: 'alt', group: 'Content' },
  access: { create: editorsOnly, read: visibleMedia, update: editableMedia, delete: deletableMedia },
  hooks: { beforeChange: [({ data, operation, originalDoc, req }) => {
    data.ownerId = operation === 'create' ? req.user?.id ?? null : originalDoc?.ownerId ?? null
    return data
  }] },
  upload: {
    staticDir: path.join(cmsRuntime().dataDir, 'uploads'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    imageSizes: [{ name: 'thumbnail', width: 640, height: 480, fit: 'inside', withoutEnlargement: true }],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    { name: 'alt', type: 'text', required: true, label: 'Describe the photo',
      admin: { description: 'Short description for people using a screen reader.' } },
    { name: 'ownerId', type: 'number', access: { read: ({ req }) => isEditor(req), create: () => false, update: () => false }, admin: { hidden: true } },
  ],
}
