import { randomBytes } from 'node:crypto'
import { APIError, type Endpoint } from 'payload'
import { isAdministrator } from '../access'

function accountID(value: unknown) {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) throw new APIError('Choose an account.', 400)
  return Number(value)
}
export const accountEndpoints: Endpoint[] = [
  { path: '/invite', method: 'post', handler: async (req) => {
    if (!isAdministrator(req.user)) throw new APIError('Only administrators can invite members.', 403)
    const body = await req.json!()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const role = body?.role || 'marketing'
    if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new APIError('Enter a name and valid email address.', 400)
    if (!['marketing', 'publisher', 'admin'].includes(role)) throw new APIError('Choose a valid role.', 400)
    const existing = await req.payload.count({ collection: 'users', where: { email: { equals: email } }, overrideAccess: true, req })
    if (existing.totalDocs) throw new APIError('This account already exists. Use Resend invitation or password recovery.', 409)
    const user = await req.payload.create({ collection: 'users', overrideAccess: true, req,
      context: { accountProvisioning: true },
      data: { name, email, role, active: true, invitedAt: new Date().toISOString(), password: randomBytes(48).toString('base64url') } })
    try {
      await req.payload.forgotPassword({ collection: 'users', data: { email }, req })
    } catch {
      throw new APIError('The account was created, but email delivery failed. Check email settings and resend the invitation.', 503)
    }
    return Response.json({ message: 'Invitation sent. The member can choose a password using the email link.', id: user.id },
      { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } },
  { path: '/resend-invitation', method: 'post', handler: async (req) => {
    if (!isAdministrator(req.user)) throw new APIError('Only administrators can resend invitations.', 403)
    const body = await req.json!()
    const user = await req.payload.findByID({ collection: 'users', id: accountID(body?.id), req, overrideAccess: true })
    if (user.active === false) throw new APIError('Reactivate this account before sending an invitation.', 400)
    await req.payload.forgotPassword({ collection: 'users', data: { email: user.email }, req })
    return Response.json({ message: 'Password setup email sent.' }, { headers: { 'Cache-Control': 'no-store' } })
  } },
]
