import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'
type Account = { role?: string; active?: boolean | null } | null | undefined
export const isAdministrator = (user: Account) => user?.role === 'admin' && user.active !== false
export const isPublisher = (user: Account) => user?.active !== false && ['publisher', 'admin'].includes(user?.role || '')
export const isEditor = (req: Pick<PayloadRequest, 'user'>) => req.user?.active !== false && ['marketing', 'publisher', 'admin'].includes(req.user?.role || '')
export const editorsOnly: Access = ({ req }) => isEditor(req)
export const publishersOnly: Access = ({ req }) => isPublisher(req.user)
export const publishField: FieldAccess = ({ req }) => isPublisher(req.user)
export const editorField: FieldAccess = ({ req }) => isEditor(req)
export const administratorField: FieldAccess = ({ req }) => isAdministrator(req.user)
export const editDraftsOrPublish: Access = ({ req, data }) => {
  if (!isEditor(req)) return false
  if (isPublisher(req.user)) return true
  if (data?._status === 'published') return false
  return { ownerId: { equals: req.user!.id } }
}
export const publishedOrEditor: Access = ({ req }) => {
  if (isPublisher(req.user)) return true
  const where: Where = isEditor(req) ? { ownerId: { equals: req.user!.id } } : { _status: { equals: 'published' } }
  return where
}
