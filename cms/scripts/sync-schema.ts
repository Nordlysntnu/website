import { preparePublicationSchema } from './prepare-publication-schema'
import { getPayload } from 'payload'
import { prepareLocalSchema, prepareAccountGuards } from './prepare-local-schema'

// Run with the local server stopped and a database backup already saved.
// Unlike seed.ts, this never creates or edits accounts, articles or photos.
process.loadEnvFile('.env.local')
prepareLocalSchema()
await preparePublicationSchema()
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })
await payload.destroy()
prepareAccountGuards()
console.log('Local schema synchronized. No seed content was written.')
