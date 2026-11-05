import { getPayload } from 'payload'
import { prepareLocalSchema } from './prepare-local-schema'

// Run with the local server stopped and a database backup already saved.
// Unlike seed.ts, this never creates or edits accounts, articles or photos.
process.loadEnvFile('.env.local')
prepareLocalSchema()
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })
await payload.destroy()
console.log('Local schema synchronized. No seed content was written.')
