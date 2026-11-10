import { installAdministratorGuards } from './schema-guards'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export function prepareLocalSchema() {
  const databaseURL = process.env.DATABASE_URL || 'file:./.local/cms.db'
  if (databaseURL !== 'file:./.local/cms.db') {
    throw new Error('Automatic demo schema upgrades support only file:./.local/cms.db. Review other databases separately.')
  }
  const databaseFile = path.resolve('.local/cms.db')
  if (!existsSync(databaseFile)) return
  const db = new DatabaseSync(databaseFile)
  // Keep existing databases on explicit, additive upgrades. Drizzle's dev
  // schema push can rebuild version tables and recreate existing indexes.
  // This upgrade adds only nullable editorial fields; it never rewrites rows.
  const additions: Record<string, string> = {
    review_note: 'text', submitted_at: 'text', submitted_by: 'text', reviewed_at: 'text',
    reviewed_by: 'text', last_edited_by: 'text', owner_id: 'numeric', owner_name: 'text',
    reviewer_id: 'numeric', reviewer_name: 'text', activity: 'text',
  }
  let hasUsers = false
  try {
    db.exec('BEGIN IMMEDIATE')
    let existingDatabase = false
    for (const table of ['posts', '_posts_v']) {
      const columns = db.prepare(`PRAGMA table_info("${table}")`).all().map((column) => column.name)
      if (!columns.length) continue // Fresh setup: Payload creates the tables.
      existingDatabase = true
      for (const [field, type] of Object.entries(additions)) {
        const column = table === '_posts_v' ? `version_${field}` : field
        if (!columns.includes(column)) db.exec(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${type}`)
      }
    }
    const userColumns = db.prepare('PRAGMA table_info("users")').all().map((column) => column.name)
    hasUsers = userColumns.length > 0
    if (userColumns.length && !userColumns.includes('notifications_read_at')) {
      db.exec('ALTER TABLE "users" ADD COLUMN "notifications_read_at" text')
    }
    if (userColumns.length && !userColumns.includes('active')) db.exec('ALTER TABLE users ADD COLUMN active integer DEFAULT 1')
    if (userColumns.length && !userColumns.includes('invited_at')) db.exec('ALTER TABLE users ADD COLUMN invited_at text')
    const mediaColumns = db.prepare('PRAGMA table_info(media)').all().map(c => c.name)
    if (mediaColumns.length && !mediaColumns.includes('owner_id')) db.exec('ALTER TABLE media ADD COLUMN owner_id numeric')
    db.exec('COMMIT')
    if (existingDatabase) process.env.CMS_SCHEMA_PUSH = 'false'
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  } finally {
    db.close()
  }
  if (hasUsers) installAdministratorGuards(databaseURL)
}

export function prepareAccountGuards() { installAdministratorGuards(process.env.DATABASE_URL || 'file:./.local/cms.db') }
