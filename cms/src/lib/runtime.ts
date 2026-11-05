import path from 'node:path'

export function cmsRuntime(env: Record<string, string | undefined> = process.env) {
  const production = env.CMS_ENV === 'production'
  if (env.CMS_ENV && !['local', 'production'].includes(env.CMS_ENV)) throw new Error('CMS_ENV must be local or production.')
  const serverURL = env.CMS_URL || 'http://127.0.0.1:3010'
  const url = new URL(serverURL)
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('CMS_URL must be an origin without credentials or a path.')
  const loopback = ['127.0.0.1', 'localhost'].includes(url.hostname)
  if (!production && !loopback) throw new Error('Public CMS URLs require CMS_ENV=production.')
  if (production && (url.protocol !== 'https:' || loopback)) throw new Error('Production CMS_URL must use a public HTTPS origin.')
  if (!env.PAYLOAD_SECRET || (production && (env.PAYLOAD_SECRET.length < 32 || /^(replace|change.?me|example)/i.test(env.PAYLOAD_SECRET)))) throw new Error('Set PAYLOAD_SECRET; production needs at least 32 random characters.')
  if (production && (!env.CMS_DATA_DIR || !path.isAbsolute(env.CMS_DATA_DIR))) throw new Error('Set an absolute CMS_DATA_DIR outside the application release.')
  const dataDir = path.resolve(env.CMS_DATA_DIR || '.local')
  const rel = path.relative(process.cwd(), dataDir)
  if (production && (!rel || (!rel.startsWith('..' + path.sep) && !path.isAbsolute(rel) && rel !== '..'))) throw new Error('CMS_DATA_DIR must be outside the application release.')
  const databaseURL = env.DATABASE_URL || `file:${path.join(dataDir, 'cms.db').replaceAll('\\', '/')}`
  if (!databaseURL.startsWith('file:')) throw new Error('v0.1 uses a local SQLite database, not a remote database URL.')
  const expectedDatabase = 'file:' + path.join(dataDir, 'cms.db').replaceAll('\\', '/')
  if (production && databaseURL !== expectedDatabase) throw new Error('Production DATABASE_URL must point to cms.db inside CMS_DATA_DIR.')
  if (production && env.CMS_SCHEMA_PUSH === 'true') throw new Error('Production requires explicit migrations, never schema push.')
  if (production && !env.SMTP_HOST) throw new Error('Configure SMTP before enabling production accounts.')
  return { production, serverURL: url.origin, dataDir, databaseURL }
}
