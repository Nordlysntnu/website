import { APIError, type CollectionConfig } from 'payload'
import { administratorField, isAdministrator, isEditor, isSignedInMember } from '../access'
import { editorialEndpoints } from '../lib/editorial-endpoints'
import { accountEndpoints } from '../lib/account-endpoints'
import { mfaEndpoints } from '../lib/mfa-endpoints'
import { isTrustedBrowser, mfaRequired, sessionIdOf, verifiedSessions } from '../lib/mfa'

const secretField = { access: { read: () => false, create: () => false, update: () => false }, admin: { hidden: true } }
// A sign-in lasts a week. The admin refreshes it while you work; signing out, deactivation,
// a role change or a 2FA reset still ends it at once.
const SIGN_IN_SECONDS = 7 * 24 * 60 * 60

export const Users: CollectionConfig = {
  slug: 'users',
  endpoints: [...editorialEndpoints, ...accountEndpoints, ...mfaEndpoints],
  labels: { singular: 'Account', plural: 'Accounts' },
  admin: {
    useAsTitle: 'name', group: 'Administration',
    hidden: ({ user }) => user?.role !== 'admin' || user?.active === false,
    defaultColumns: ['name', 'email', 'role', 'active'],
    components: { beforeList: ['/components/InviteAccount#InviteAccount'] },
    description: 'Invite members and manage their roles. Deactivate accounts when members leave.',
  },
  auth: {
    tokenExpiration: SIGN_IN_SECONDS, maxLoginAttempts: 5, lockTime: 5 * 60 * 1000, useSessions: true,
    cookies: { sameSite: 'Strict', secure: process.env.CMS_ENV === 'production' },
    forgotPassword: {
      expiration: 60 * 60 * 1000,
      generateEmailSubject: () => 'Set your Nordlys CMS password',
      generateEmailHTML: ({ token } = {}) => {
        const origin = process.env.CMS_URL || 'http://127.0.0.1:3010'
        const link = new URL('/admin/reset/' + encodeURIComponent(token || ''), origin).href
        return '<p>You were invited to Nordlys CMS or requested a new password.</p><p><a href="' + link + '">Choose your password</a></p><p>This link expires after one hour and can be used once. If you did not expect this email, you can ignore it.</p>'
      },
    },
  },
  access: {
    // Members reach the admin UI before 2FA so the two-factor screen can load; content access still requires 2FA.
    admin: ({ req }) => isSignedInMember(req.user),
    create: () => false, // Only the controlled invitation endpoint / offline bootstrap can provision users.
    read: ({ req }) => isAdministrator(req.user) ? true : isSignedInMember(req.user) ? { id: { equals: req.user!.id } } : false,
    update: ({ req }) => isAdministrator(req.user) ? true : isEditor(req) ? { id: { equals: req.user!.id } } : false,
    delete: () => false, // Deactivation preserves authorship and audit history.
  },
  hooks: {
    beforeOperation: [({ args, operation, req }) => {
      if ((operation === 'resetPassword' || operation === 'create') && (typeof args.data?.password !== 'string' || args.data.password.length < 12)) throw new APIError('Use at least 12 characters for your password.', 400)
      if (operation === 'create' && req.payloadAPI !== 'local' && !req.context.accountProvisioning) {
        throw new APIError('Accounts are invitation-only.', 403)
      }
    }],
    beforeLogin: [({ user }) => {
      if (user.active === false) throw new APIError('This account is inactive. Contact a CMS administrator.', 403)
      return user
    }],
    afterLogin: [async ({ req, token, user }) => {
      // A browser remembered after an authenticator code skips the code for this new session.
      const sid = sessionIdOf(token)
      if (!mfaRequired() || !sid || !isTrustedBrowser(req.headers.get('cookie'), user, req.payload.secret)) return user
      await req.payload.update({ collection: 'users', id: user.id, data: { mfaSessionIds: verifiedSessions(user, sid) } as never,
        overrideAccess: true, req, context: { mfa: true } })
      return user
    }],
    beforeChange: [async ({ data, originalDoc, req }) => {
      if (!originalDoc) return data
      if (req.user && !isAdministrator(req.user) && data.email && data.email !== originalDoc.email) {
        throw new APIError('Ask an administrator to change your account email.', 403)
      }
      if (originalDoc.role === 'admin' && originalDoc.active !== false && (data.active === false || (data.role && data.role !== 'admin'))) {
        const admins = await req.payload.count({ collection: 'users', overrideAccess: true, req,
          where: { and: [{ role: { equals: 'admin' } }, { active: { not_equals: false } }] } })
        if (admins.totalDocs <= 1) throw new APIError('Keep at least one active administrator.', 400)
      }
      if (data.active === false || (data.role && data.role !== originalDoc.role)) { data.sessions = []; data.mfaSessionIds = [] }
      return data
    }],
  },
  fields: [
    { name: 'sendInvitation', type: 'ui', admin: { components: { Field: '/components/AccountInvitation#AccountInvitation' } } },
    { name: 'name', type: 'text', required: true, maxLength: 100 },
    { name: 'active', type: 'checkbox', defaultValue: true,
      access: { create: administratorField, update: administratorField },
      admin: { description: 'Disabling an account ends its existing sessions and prevents sign-in.' } },
    { name: 'invitedAt', type: 'date', access: { create: () => false, update: () => false }, admin: { readOnly: true } },
    { name: 'notificationsReadAt', type: 'date', access: { create: () => false, update: () => false }, admin: { hidden: true } },
    { name: 'role', type: 'select', required: true, defaultValue: 'marketing',
      options: [{ label: 'Writer — own drafts', value: 'marketing' },
        { label: 'Publisher — review and publish', value: 'publisher' },
        { label: 'Administrator — accounts and publishing', value: 'admin' }],
      access: { create: administratorField, update: administratorField },
    },
    { name: 'twoFactor', type: 'ui', admin: { components: { Field: '/components/AccountTwoFactor#AccountTwoFactor' } } },
    { name: 'totpEnabledAt', type: 'date', label: 'Two-factor enabled',
      access: { read: ({ req, doc }) => isAdministrator(req.user) || (!!req.user && doc?.id === req.user.id), create: () => false, update: () => false },
      admin: { readOnly: true, position: 'sidebar', description: 'Set up with an authenticator app at first sign-in.' } },
    // Two-factor internals: never readable or writable through the API; only server code changes them.
    ...(['totpSecret', 'totpPendingSecret'] as const).map(name => ({ name, type: 'text' as const, ...secretField })),
    ...(['totpLastStep', 'totpFailures'] as const).map(name => ({ name, type: 'number' as const, ...secretField })),
    { name: 'totpLockedUntil', type: 'date', ...secretField },
    { name: 'mfaSessionIds', type: 'json', ...secretField },
    { name: 'password', type: 'text', hidden: true,
      validate: (value: unknown) => !value || (typeof value === 'string' && value.length >= 12) || 'Use at least 12 characters for your password.' },
  ],
}
