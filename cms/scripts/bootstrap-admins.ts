import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { getPayload } from 'payload'
if (existsSync('.env.local')) process.loadEnvFile('.env.local')
const administrators = JSON.parse(process.env.CMS_BOOTSTRAP_ADMINS || '[]') as { name: string; email: string }[]
if (administrators.length !== 2 || administrators.some((a) => !a.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email || ''))) {
  throw new Error('Set CMS_BOOTSTRAP_ADMINS to the two approved administrators (name/email).')
}
if (new Set(administrators.map(a => a.email.toLowerCase())).size !== 2) throw new Error('Use two different administrator addresses.')
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })
try {
  for (const account of administrators) {
    const email = account.email.trim().toLowerCase()
    const existing = (await payload.find({ collection: 'users', where: { email: { equals: email } }, overrideAccess: true, limit: 1 })).docs[0]
    if (existing && (existing.role !== 'admin' || existing.active === false)) throw new Error('Existing account needs a reviewed role change; bootstrap will not promote or reactivate it.')
    if (!existing) await payload.create({ collection: 'users', overrideAccess: true,
      context: { accountProvisioning: true }, data: {
        name: account.name.trim(), email, role: 'admin', active: true, password: randomBytes(48).toString('base64url'),
      } })
    if (process.env.CMS_EMAIL_MODE === 'manual') {
      // No mail relay yet: print the one-hour link for the operator to deliver privately. Do not save this output.
      const token = await payload.forgotPassword({ collection: 'users', data: { email }, disableEmail: true })
      console.log('Setup link for ' + email + ' (valid one hour): ' + new URL('/admin/reset/' + encodeURIComponent(String(token)), process.env.CMS_URL).href)
    } else {
      await payload.forgotPassword({ collection: 'users', data: { email } })
      console.log('Password setup email requested for ' + email)
    }
  }
} finally { await payload.destroy() }
