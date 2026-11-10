import { APIError, type Endpoint } from 'payload'
import { isEditor } from '../access'
import { notificationsFor } from './notifications'

export const editorialEndpoints: Endpoint[] = [
  { path: '/reviewers', method: 'get', handler: async (req) => {
    if (!isEditor(req)) throw new APIError('Sign in to choose a reviewer.', 403)
    const result = await req.payload.find({ collection: 'users', overrideAccess: true, req,
      where: { role: { in: ['publisher', 'admin'] }, active: { not_equals: false } }, depth: 0, pagination: false, select: { name: true } })
    return Response.json({ reviewers: result.docs.map(({ id, name }) => ({ id, name })) }, { headers: { 'Cache-Control': 'no-store' } })
  } },
  { path: '/notifications', method: 'get', handler: async (req) => {
    if (!isEditor(req)) throw new APIError('Sign in to read notifications.', 403)
    return Response.json({ items: await notificationsFor(req.payload, req.user!), readAt: req.user!.notificationsReadAt || null },
      { headers: { 'Cache-Control': 'no-store' } })
  } },
  { path: '/read-notifications', method: 'post', handler: async (req) => {
    if (!isEditor(req)) throw new APIError('Sign in to mark notifications as read.', 403)
    const body = await req.json!()
    const through = typeof body?.through === 'string' ? Date.parse(body.through) : NaN
    if (!Number.isFinite(through) || through > Date.now()) throw new APIError('Choose a valid notification date.', 400)
    const existing = Date.parse(req.user!.notificationsReadAt || '') || 0
    const readAt = new Date(Math.max(existing, through)).toISOString()
    await req.payload.update({ collection: 'users', id: req.user!.id, data: { notificationsReadAt: readAt }, overrideAccess: true, req })
    return Response.json({ readAt }, { headers: { 'Cache-Control': 'no-store' } })
  } },
]
