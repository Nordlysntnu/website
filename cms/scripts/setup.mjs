import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'

if (process.env.CMS_ENV === 'production') throw new Error('Use the production migration/bootstrap commands, not demo setup.')
if (existsSync('.env.local') && /^CMS_ENV=production$/m.test(readFileSync('.env.local', 'utf8'))) throw new Error('Demo setup cannot use a production environment.')
mkdirSync('.local', { recursive: true })
if (!existsSync('.env.local')) {
  writeFileSync('.env.local', [
    'CMS_URL=http://127.0.0.1:3010',
    `PAYLOAD_SECRET=${randomBytes(48).toString('hex')}`,
    'DATABASE_URL=file:./.local/cms.db',
    '',
  ].join('\n'), { mode: 0o600 })
}
const accounts = existsSync('.local/accounts.json') ? JSON.parse(readFileSync('.local/accounts.json', 'utf8')) : []
const labels = { marketing: 'Marketing Demo', publisher: 'Leader Demo', admin: 'Administrator Demo' }
for (const role of ['marketing', 'publisher', 'admin']) {
  if (!accounts.some(account => account.role === role)) accounts.push({ role, name: labels[role], email: role + '@nordlys.example.test', password: randomBytes(18).toString('base64url') })
}
writeFileSync('.local/accounts.json', JSON.stringify(accounts, null, 2) + '\n', { mode: 0o600 })
writeFileSync('.local/Demo-login.md', ['# Local Nordlys CMS demo', '', 'Open http://127.0.0.1:3010/admin.', 'These accounts are local test accounts; they are not real Nordlys members.', '', ...accounts.flatMap(({role,email,password}) => ['## ' + labels[role], '', 'Email: ' + email, '', 'Password: ' + password, ''])].join('\n'), { mode: 0o600 })
console.log('Local configuration ready. Demo logins are in .local/Demo-login.md (ignored by Git).')
