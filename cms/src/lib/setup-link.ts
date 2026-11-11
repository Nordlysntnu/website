import type { PayloadRequest } from 'payload'
import { cmsRuntime } from './runtime'

/**
 * Sends the one-hour password setup email, or in CMS_EMAIL_MODE=manual returns the link so an
 * administrator can pass it on through a private channel. The link grants account access: never log it.
 */
export async function sendPasswordSetup(req: PayloadRequest, email: string) {
  const runtime = cmsRuntime()
  if (runtime.emailMode !== 'manual') {
    await req.payload.forgotPassword({ collection: 'users', data: { email }, req })
    return { setupLink: undefined }
  }
  const token = await req.payload.forgotPassword({ collection: 'users', data: { email }, req, disableEmail: true })
  return { setupLink: new URL('/admin/reset/' + encodeURIComponent(String(token)), runtime.serverURL).href }
}
