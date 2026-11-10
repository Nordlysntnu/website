import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import type { EmailAdapter } from 'payload'
import { cmsRuntime } from './runtime'

export async function cmsEmail(env: Record<string, string | undefined> = process.env): Promise<EmailAdapter> {
  const runtime = cmsRuntime(env)
  if (runtime.production && runtime.emailMode === 'smtp') {
    const port = Number(env.SMTP_PORT || '587')
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Set a valid SMTP_PORT.')
    if (!env.SMTP_FROM || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.SMTP_FROM)) throw new Error('Set SMTP_FROM to an approved sender address.')
    if (!!env.SMTP_USER !== !!env.SMTP_PASSWORD) throw new Error('Set both SMTP_USER and SMTP_PASSWORD, or neither for an IP-authorized relay.')
    return nodemailerAdapter({
      defaultFromAddress: env.SMTP_FROM, defaultFromName: 'Nordlys CMS', skipVerify: true,
      transportOptions: {
        host: env.SMTP_HOST, port, secure: env.SMTP_SECURE === 'true',
        connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 30000,
        requireTLS: env.SMTP_SECURE !== 'true',
        ...(env.SMTP_USER ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } } : {}),
      },
    })
  }
  // Local tests/previews and production manual mode never send mail. Messages are private local files.
  return () => ({
    name: 'local-outbox', defaultFromAddress: 'cms@example.test', defaultFromName: 'Nordlys CMS',
    sendEmail: async (message) => {
      const outbox = path.join(runtime.dataDir, 'outbox')
      await mkdir(outbox, { recursive: true })
      await writeFile(path.join(outbox, randomUUID() + '.json'), JSON.stringify(message, null, 2), { mode: 0o600 })
    },
  })
}
