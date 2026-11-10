import { DatabaseSync, backup } from 'node:sqlite'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { publicationStatements } from '../src/migrations/20261106_142318_website_publication'

// Stop the local server before running setup/schema:sync. Production uses migrations.
export async function upgradePublicationDatabase(databaseFile: string) {
  if (!existsSync(databaseFile)) return { upgraded: false }
  const db = new DatabaseSync(databaseFile)
  try {
    const columns = (table: string) => db.prepare('PRAGMA table_info("' + table + '")').all().map(c => c.name)
    if (!columns('posts').length) return { upgraded: false }
    const sentinels = [
      columns('posts').includes('legacy_key'), columns('_posts_v').includes('version_legacy_key'),
      columns('media').includes('legacy_source'), columns('legacy_imports').length > 0,
      columns('payload_jobs').length > 0, columns('payload_jobs_log').length > 0,
      columns('website_publication').length > 0,
      columns('payload_locked_documents_rels').includes('legacy_imports_id'),
    ]
    if (sentinels.every(Boolean)) return { upgraded: false }
    if (sentinels.some(Boolean)) throw new Error('Partial publication schema detected. Review the database and its backup before continuing.')
    const backupDir = path.join(path.dirname(databaseFile), 'schema-backups')
    await mkdir(backupDir, { recursive: true, mode: 0o700 })
    const backupFile = path.join(backupDir, 'before-publication-' + Date.now() + '.db')
    await backup(db, backupFile)
    db.exec('BEGIN IMMEDIATE')
    try {
      for (const statement of publicationStatements) db.exec(statement)
      if(columns('payload_migrations').length) {
        const batch=Number(db.prepare('SELECT MAX(batch) AS batch FROM payload_migrations').get()?.batch || 0)+1
        db.prepare('INSERT INTO payload_migrations (name,batch) VALUES (?,?)').run('20261106_142318_website_publication',batch)
      }
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
    return { upgraded: true, backupFile }
  } finally { db.close() }
}
export async function preparePublicationSchema() {
  if (process.env.CMS_ENV === 'production' || (process.env.DATABASE_URL || 'file:./.local/cms.db') !== 'file:./.local/cms.db') {
    throw new Error('This upgrader is only for the default local demo. Production requires reviewed migrations.')
  }
  const result = await upgradePublicationDatabase(path.resolve('.local/cms.db'))
  if (result.upgraded) console.log('Added publication tables. A database backup was saved in .local/schema-backups.')
}
