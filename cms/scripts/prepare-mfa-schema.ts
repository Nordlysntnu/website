import { DatabaseSync, backup } from 'node:sqlite'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { twoFactorColumns } from '../src/migrations/20261110_024053_two_factor'

// Adds the two-factor columns to an existing local demo database. Production uses migrations.
export async function upgradeTwoFactorDatabase(databaseFile: string) {
  if (!existsSync(databaseFile)) return { upgraded: false }
  const db = new DatabaseSync(databaseFile)
  try {
    const existing = db.prepare('PRAGMA table_info("users")').all().map(column => column.name)
    if (!existing.length) return { upgraded: false }
    const missing = twoFactorColumns.filter(([name]) => !existing.includes(name))
    if (!missing.length) return { upgraded: false }
    if (missing.length !== twoFactorColumns.length) throw new Error('Partial two-factor schema detected. Review the database and its backup before continuing.')
    const backupDir = path.join(path.dirname(databaseFile), 'schema-backups')
    await mkdir(backupDir, { recursive: true, mode: 0o700 })
    const backupFile = path.join(backupDir, 'before-two-factor-' + Date.now() + '.db')
    await backup(db, backupFile)
    db.exec('BEGIN IMMEDIATE')
    try {
      for (const [name, type] of missing) db.exec(`ALTER TABLE users ADD ${name} ${type};`)
      if (db.prepare('PRAGMA table_info("payload_migrations")').all().length) {
        const batch = Number(db.prepare('SELECT MAX(batch) AS batch FROM payload_migrations').get()?.batch || 0) + 1
        db.prepare('INSERT INTO payload_migrations (name,batch) VALUES (?,?)').run('20261110_024053_two_factor', batch)
      }
      db.exec('COMMIT')
    } catch (error) { db.exec('ROLLBACK'); throw error }
    return { upgraded: true, backupFile }
  } finally { db.close() }
}
export async function prepareTwoFactorSchema() {
  if (process.env.CMS_ENV === 'production' || (process.env.DATABASE_URL || 'file:./.local/cms.db') !== 'file:./.local/cms.db') {
    throw new Error('This upgrader is only for the default local demo. Production requires reviewed migrations.')
  }
  const result = await upgradeTwoFactorDatabase(path.resolve('.local/cms.db'))
  if (result.upgraded) console.log('Added two-factor columns. A database backup was saved in .local/schema-backups.')
}
