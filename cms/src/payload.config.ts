import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { BlocksFeature, FixedToolbarFeature, HeadingFeature, lexicalEditor, LinkFeature, UploadFeature } from '@payloadcms/richtext-lexical'
import { PhotoRowBlock, photoLayoutField } from './lib/article-blocks'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { cmsRuntime } from './lib/runtime'
import { cmsEmail } from './lib/email'
import { Users } from './collections/Users'
import { Posts } from './collections/Posts'
import { Media } from './collections/Media'
import { LegacyImports } from './collections/LegacyImports'
import { PanelAdoptions } from './collections/PanelAdoptions'
import { WebsitePublication } from './globals/WebsitePublication'
import { publishWebsiteTask } from './publishing/task'
import { publicationEndpoints } from './publishing/endpoints'
import { adoptionEndpoints } from './lib/adoption-endpoints'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const runtime = cmsRuntime()
const serverURL = runtime.serverURL

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET!,
  serverURL,
  cors: [serverURL],
  csrf: [serverURL],
  admin: {
    user: 'users',
    theme: 'all',
    importMap: { baseDir: dirname },
    meta: { titleSuffix: ' | Nordlys CMS' },
    components: {
      actions: ['/components/AdminThemeToggle#AdminThemeToggle'],
      beforeDashboard: ['/components/DemoGuide#DemoGuide'],
      beforeLogin: ['/components/LoginNote#LoginNote'],
      providers: ['/components/TwoFactorGate#TwoFactorGate'],
      graphics: { Logo: '/components/Logo#Logo', Icon: '/components/Logo#Icon' },
    },
  },
  collections: [Users, Posts, Media, LegacyImports, PanelAdoptions],
  globals: [WebsitePublication],
  jobs: { tasks: [publishWebsiteTask], enableConcurrencyControl: true, deleteJobOnComplete: false,
    access: { run: () => false, queue: () => false, cancel: () => false } },
  endpoints: [...publicationEndpoints, ...adoptionEndpoints, { path: '/health', method: 'get', handler: async (req) => {
    try {
      await req.payload.count({ collection: 'users', overrideAccess: true, req })
      return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
    } catch { return Response.json({ status: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }) }
  } }],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter(({ key }) => !['upload', 'relationship', 'heading', 'link'].includes(key)),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
      LinkFeature({ enabledCollections: ['posts'] }),
      UploadFeature({ enabledCollections: ['media'], collections: { media: { fields: [
        { name: 'caption', type: 'text', label: 'Photo caption', admin: { description: 'Optional text below this photo in the article.' } },
        photoLayoutField,
      ] } } }),
      BlocksFeature({ blocks: [PhotoRowBlock] }),
      FixedToolbarFeature(),
    ],
  }),
  db: sqliteAdapter({
    wal: true, busyTimeout: 5000,
    // Apply local schema changes once through setup/seed, not during parallel requests.
    push: !runtime.production && process.env.CMS_SCHEMA_PUSH === 'true',
    client: { url: runtime.databaseURL },
  }),
  email: await cmsEmail(),
  sharp,
  upload: { limits: { fileSize: 8 * 1024 * 1024 }, abortOnLimit: true },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  telemetry: false,
  graphQL: { disable: true },
})
