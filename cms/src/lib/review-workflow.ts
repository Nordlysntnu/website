import { APIError, type CollectionBeforeChangeHook } from 'payload'
import { randomUUID } from 'node:crypto'
import { articleReadiness } from './editorial'
import { activities } from './notifications'

export const applyReviewWorkflow: CollectionBeforeChangeHook = async ({ data, originalDoc, req, operation }) => {
  const publisher = req.user?.active !== false && ['publisher', 'admin'].includes(req.user?.role || '')
  const editor = publisher || req.user?.role === 'marketing'
  // Local seed scripts have no user. API requests always need an editor.
  if (!editor) return data
  const previous = originalDoc?.review || 'writing'
  const next = data.review ?? previous
  const publishing = data._status === 'published'
  const note = typeof data.reviewNote === 'string' ? data.reviewNote.trim() : originalDoc?.reviewNote || ''
  if (!['writing', 'ready', 'changes'].includes(next)) throw new APIError('Unknown review status.', 400)
  if (note.length > 2000) throw new APIError('Keep review feedback under 2,000 characters.', 400)

  if (next === 'changes' && previous !== 'changes' && !publisher) {
    throw new APIError('Only a publisher can request changes.', 403)
  }
  if (next === 'changes' && !note) {
    throw new APIError('Add a short explanation before requesting changes.', 400)
  }
  if ((next === 'ready' && previous !== 'ready') || publishing) {
    const missing = articleReadiness({ ...originalDoc, ...data }).filter((item) => !item.complete)
    if (missing.length) throw new APIError(`${missing.map((item) => item.label).join('. ')} before sending for review or publishing.`, 400)
  }

  // These fields are an internal receipt, never values supplied by an API client.
  for (const key of ['submittedAt', 'submittedBy', 'reviewedAt', 'reviewedBy', 'lastEditedBy']) {
    data[key] = originalDoc?.[key] ?? null
  }
  const name = req.user?.name || 'Nordlys editor'
  data.ownerId = operation === 'create' ? req.user!.id : originalDoc?.ownerId ?? null
  data.ownerName = operation === 'create' ? name : originalDoc?.ownerName ?? null
  const reviewerId = data.reviewerId === undefined ? originalDoc?.reviewerId ?? null : data.reviewerId
  data.reviewerName = originalDoc?.reviewerName ?? null
  if (reviewerId !== null && (!Number.isSafeInteger(reviewerId) || reviewerId <= 0)) {
    throw new APIError('Choose a publisher from the reviewer list.', 400)
  }
  if (reviewerId !== null) {
    const reviewers = await req.payload.find({ collection: 'users',
      where: { and: [{ id: { equals: reviewerId } }, { role: { in: ['publisher', 'admin'] }, active: { not_equals: false } }] },
      overrideAccess: true, depth: 0, limit: 1, req })
    if (!reviewers.docs[0]) throw new APIError('This reviewer is no longer a publisher. Choose another or use the shared queue.', 400)
    data.reviewerName = reviewers.docs[0].name
  } else data.reviewerName = null
  data.reviewerId = reviewerId
  const activity = operation === 'create' ? [] : activities(originalDoc?.activity)
  const now = new Date().toISOString()
  const notify = (kind: 'submitted' | 'changes' | 'published' | 'assigned', recipients: number[]) => {
    if (recipients.length) activity.push({ id: randomUUID(), kind, at: now, recipients: [...new Set(recipients)] })
  }
  const submitted = next === 'ready' && previous !== 'ready' && !publishing
  const reassigned = next === 'ready' && reviewerId !== (originalDoc?.reviewerId ?? null) && !publishing
  if (submitted || reassigned) {
    const recipients = reviewerId === null
      ? (await req.payload.find({ collection: 'users', where: { role: { in: ['publisher', 'admin'] }, active: { not_equals: false } },
        overrideAccess: true, pagination: false, depth: 0, req })).docs.map((user) => user.id)
      : [reviewerId]
    notify(submitted ? 'submitted' : 'assigned', recipients)
  }
  if (next === 'changes' && (previous !== 'changes' || note !== originalDoc?.reviewNote) && data.ownerId) {
    notify('changes', [data.ownerId])
  }
  if (publishing && originalDoc?._status !== 'published' && data.ownerId) notify('published', [data.ownerId])
  // Server-generated events live with the revision and are never accepted from clients.
  // Keep a bounded history; full earlier revisions remain in Payload's version history.
  data.activity = activity.slice(-50)
  data.lastEditedBy = name
  if (next === 'ready' && previous !== 'ready') {
    data.submittedAt = new Date().toISOString()
    data.submittedBy = name
  }
  if (next === 'changes' && (previous !== 'changes' || note !== originalDoc?.reviewNote)) {
    data.reviewNote = note
    data.reviewedAt = new Date().toISOString()
    data.reviewedBy = name
  }
  // Keep the feedback's author/date when someone later publishes the article.
  // The published version records its publisher through lastEditedBy.
  // A published article is no longer waiting in the review inbox.
  if (publishing) data.review = 'writing'
  // Saving a new revision starts a fresh review cycle; the public copy is kept.
  else if (originalDoc?._status === 'published' && next !== 'ready' && next !== 'changes') data.review = 'writing'
  return data
}
