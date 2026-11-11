import type { Payload } from 'payload'
import type { User } from '../payload-types'

export type Activity = { id: string; kind: 'submitted' | 'assigned' | 'changes' | 'published'; at: string; recipients: number[] }
export type NotificationItem = { id: string; postID: number; title: string; message: string; at: string }
export function activities(value: unknown): Activity[] {
  if (!Array.isArray(value)) return []
  return value.filter((event): event is Activity => Boolean(event && typeof event.id === 'string' &&
    ['submitted', 'assigned', 'changes', 'published'].includes(event.kind) && typeof event.at === 'string' && Array.isArray(event.recipients)))
}
export async function notificationsFor(payload: Payload, user: User) {
  const posts = await payload.find({ collection: 'posts', user, overrideAccess: false, draft: true,
    depth: 0, pagination: false, select: { title: true, activity: true } })
  const messages = { submitted: 'Ready for your review', assigned: 'Assigned to you for review',
    changes: 'Changes requested — read the feedback', published: 'Your article was published' }
  return posts.docs.flatMap((post) => activities(post.activity).filter((event) => event.recipients.includes(user.id))
    .map((event) => ({ id: event.id, postID: post.id, title: post.title, message: messages[event.kind], at: event.at })))
    .sort((a, b) => b.at.localeCompare(a.at))
}
