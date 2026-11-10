import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'
import { mfaSatisfied, type MfaAccount } from './lib/mfa'
type Account = ({ role?: string; active?: boolean | null } & NonNullable<MfaAccount>) | null | undefined
const roles = ['marketing', 'publisher', 'admin']
/** An active CMS member, before the second factor is checked. Only for sign-in/2FA flows. */
export const isSignedInMember = (user: Account) => !!user && user.active !== false && roles.includes(user.role || '')
const verified = (user: Account) => isSignedInMember(user) && mfaSatisfied(user)
export const isAdministrator = (user: Account) => verified(user) && user!.role === 'admin'
export const isPublisher = (user: Account) => verified(user) && ['publisher', 'admin'].includes(user!.role || '')
export const isEditor = (req: Pick<PayloadRequest, 'user'>) => verified(req.user as Account)
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
