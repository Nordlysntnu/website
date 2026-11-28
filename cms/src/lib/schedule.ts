import { randomUUID } from 'node:crypto'
import { APIError, type CollectionBeforeChangeHook, type Payload } from 'payload'
import type { Post, User } from '../payload-types'
import { articleReadiness } from './editorial'
import { activities } from './notifications'

// Scheduled publishing (#96). A publisher sets "Publish at" on a draft and saves it; the website
// publisher service publishes the latest draft at that time, as that publisher. A writer's later
// change cancels the schedule, so nothing unreviewed is published.

const isPublisherRole = (user?: { role?: string | null; active?: boolean | null } | null) =>
  Boolean(user) && user!.active !== false && ['publisher', 'admin'].includes(user!.role || '')
const time = (value: unknown) => value ? new Date(String(value)).getTime() : null
const MIN_LEAD_MS = 60_000

/** Runs after the review workflow, which rebuilds the activity list. */
export const applySchedule: CollectionBeforeChangeHook = async ({ data, originalDoc, req, operation }) => {
  const previous = originalDoc?.publishAt ?? null
  const clear = () => { data.publishAt = null; data.scheduledBy = null; data.scheduledByName = null }
  // Publishing (now or by the schedule itself) ends any schedule.
  if (data._status === 'published') { clear(); return data }
  // A writer's change after scheduling needs a new review: cancel and tell the publisher.
  if (operation === 'update' && previous && req.user?.role === 'marketing') {
    const scheduler = originalDoc?.scheduledBy
    clear()
    if (typeof scheduler === 'number') {
      const activity = Array.isArray(data.activity) ? data.activity : activities(originalDoc?.activity)
      data.activity = [...activity, { id: randomUUID(), kind: 'unscheduled', at: new Date().toISOString(), recipients: [scheduler] }].slice(-50)
    }
    return data
  }
  const next = data.publishAt === undefined ? previous : data.publishAt
  if (!next) { clear(); return data }
  if (time(next) === time(previous)) {
    data.scheduledBy = originalDoc?.scheduledBy ?? null
    data.scheduledByName = originalDoc?.scheduledByName ?? null
    return data
  }
  // Field access already limits "Publish at" to publishers; this keeps API clients honest too.
  if (!isPublisherRole(req.user)) throw new APIError('Only a publisher can schedule an article.', 403)
  if (time(next)! < Date.now() + MIN_LEAD_MS) throw new APIError('Choose a time at least a minute from now, or publish it now.', 400)
  const missing = articleReadiness({ ...originalDoc, ...data }).filter((item) => !item.complete)
  if (missing.length) throw new APIError(`${missing.map((item) => item.label).join('. ')} before scheduling.`, 400)
  data.publishAt = new Date(time(next)!).toISOString()
  data.scheduledBy = req.user!.id
  data.scheduledByName = req.user!.name || 'Nordlys publisher'
  return data
}

/** Drafts with a publish time, soonest first. Writers only see their own (access rules apply). */
export async function scheduledPosts(payload: Payload, user: User, limit = 5) {
  return payload.find({ collection: 'posts', overrideAccess: false, user, draft: true, depth: 0, limit, sort: 'publishAt',
    where: { publishAt: { exists: true } } })
}

/**
 * Publishes every draft whose time has come, as the publisher who scheduled it. Called by the
 * website publisher service every few seconds. A schedule whose publisher can no longer publish
 * is cancelled instead, and both that person and the article's owner are told.
 */
export async function publishDuePosts(payload: Payload, now = new Date()) {
  const due = await payload.find({ collection: 'posts', overrideAccess: true, draft: true, depth: 0, pagination: false,
    where: { publishAt: { less_than_equal: now.toISOString() } } })
  const published: number[] = []
  const cancelled: number[] = []
  // Removes the schedule from the draft and tells the scheduler and the owner.
  const cancel = async (post: Post, reason: string) => {
    const recipients = [post.scheduledBy, post.ownerId].filter((id): id is number => typeof id === 'number')
    await payload.update({ collection: 'posts', id: post.id, overrideAccess: true, draft: true, depth: 0,
      data: { publishAt: null, scheduledBy: null, scheduledByName: null,
        activity: [...activities(post.activity), { id: randomUUID(), kind: 'unscheduled', at: now.toISOString(), recipients: [...new Set(recipients)] }].slice(-50) } })
    cancelled.push(post.id)
    payload.logger.warn({ msg: 'Scheduled publishing cancelled: ' + reason, post: post.id })
  }
  for (const post of due.docs as Post[]) {
    const scheduler = typeof post.scheduledBy === 'number'
      ? await payload.findByID({ collection: 'users', id: post.scheduledBy, overrideAccess: true, depth: 0, disableErrors: true }) as User | null
      : null
    try {
      if (!scheduler || !isPublisherRole(scheduler)) {
        await cancel(post, 'the person who scheduled it can no longer publish.')
        continue
      }
      try {
        // Access was checked when the schedule was set; that 2FA session is gone now.
        await payload.update({ collection: 'posts', id: post.id, overrideAccess: true, user: scheduler, depth: 0,
          data: { _status: 'published', publishAt: null } })
        published.push(post.id)
      } catch (error) {
        // The article itself is not ready (for example its text was removed): trying again will not help.
        if (error instanceof APIError) await cancel(post, error.message)
        else throw error
      }
    } catch (error) {
      payload.logger.error({ err: error, msg: 'Scheduled publishing failed; it is tried again.', post: post.id })
    }
  }
  return { published, cancelled }
}
