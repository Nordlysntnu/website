import type { Media, Post } from '../payload-types'

export const departments = ['Team', 'Board', 'Aero & Composites', 'Business', 'Electrical', 'Logistics', 'Marketing', 'Mechanical', 'Software'] as const

export function monthAndYear(value?: string | null) {
  if (!value || Number.isNaN(Date.parse(value))) return 'New update'
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value))
}

function walk(value: unknown, visit: (node: Record<string, unknown>) => void) {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) { value.forEach((item) => walk(item, visit)); return }
  const node = value as Record<string, unknown>
  visit(node)
  if (node.root) walk(node.root, visit)
  if (node.children) walk(node.children, visit)
}

export function excerpt(post: Post) {
  if (post.summary?.trim()) return post.summary.trim()
  const text: string[] = []
  walk(post.content, (node) => { if (node.type === 'text' && typeof node.text === 'string') text.push(node.text) })
  const body = text.join(' ').replace(/\s+/g, ' ').trim()
  return body.length > 180 ? `${body.slice(0, 177).trimEnd()}…` : body
}

export function asPhoto(value: unknown): Media | undefined {
  return value && typeof value === 'object' && 'url' in value && typeof value.url === 'string' ? value as Media : undefined
}

export function coverPhoto(post: Post) {
  const chosen = asPhoto(post.coverImage)
  if (chosen) return chosen
  const firstGallery = asPhoto(post.gallery?.[0]?.image)
  if (firstGallery) return firstGallery
  let inline: Media | undefined
  walk(post.content, (node) => {
    if (!inline && node.type === 'upload' && node.relationTo === 'media') inline = asPhoto(node.value)
  })
  return inline
}

// Access control must include photos in the body and cover, not just the gallery.
export function postPhotoIDs(post: Post) {
  const ids = new Set<number>()
  function add(value: unknown) {
    const raw = value && typeof value === 'object' && 'id' in value ? value.id : value
    const id = typeof raw === 'string' && /^\d+$/.test(raw) ? Number(raw) : raw
    if (typeof id === 'number' && Number.isSafeInteger(id) && id > 0) ids.add(id)
  }
  add(post.coverImage)
  post.gallery?.forEach(({ image }) => add(image))
  walk(post.content, (node) => { if (node.type === 'upload' && node.relationTo === 'media') add(node.value) })
  return [...ids]
}
