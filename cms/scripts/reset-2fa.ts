import { existsSync } from 'node:fs'
import { getPayload } from 'payload'
// Offline recovery for a member (including the last administrator) who lost their authenticator.
// Run as the CMS operator with the production environment loaded: npm run 2fa:reset -- member@example.org
if (existsSync('.env.local')) process.loadEnvFile('.env.local')
const email = String(process.argv[2] || '').trim().toLowerCase()
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Usage: npm run 2fa:reset -- member@example.org')
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })
try {
  const user = (await payload.find({ collection: 'users', where: { email: { equals: email } }, overrideAccess: true, limit: 1 })).docs[0]
  if (!user) throw new Error('No account with that email.')
  await payload.update({ collection: 'users', id: user.id, overrideAccess: true, context: { mfa: true }, data: {
    totpSecret: null, totpPendingSecret: null, totpEnabledAt: null, totpLastStep: null, totpFailures: 0,
    totpLockedUntil: null, mfaSessionIds: [], sessions: [] } as never })
  console.log('Two-factor sign-in reset for ' + email + '. They set up a new authenticator at next sign-in.')
} finally { await payload.destroy() }
