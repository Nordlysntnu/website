import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
export function sqliteFile(url: string) {
  if (!url.startsWith('file:')) throw new Error('Expected a local SQLite file.')
  return url.startsWith('file://') ? fileURLToPath(url) : path.resolve(url.slice(5))
}
export const administratorGuards = [
  `CREATE TRIGGER IF NOT EXISTS users_keep_last_admin_update
  BEFORE UPDATE OF role, active ON users
  WHEN OLD.role = 'admin' AND COALESCE(OLD.active, 1) = 1
    AND (NEW.role <> 'admin' OR COALESCE(NEW.active, 1) = 0)
    AND (SELECT COUNT(*) FROM users WHERE role = 'admin' AND COALESCE(active, 1) = 1) <= 1
  BEGIN SELECT RAISE(ABORT, 'Keep at least one active administrator'); END`,
  `CREATE TRIGGER IF NOT EXISTS users_keep_last_admin_delete
  BEFORE DELETE ON users
  WHEN OLD.role = 'admin' AND COALESCE(OLD.active, 1) = 1
    AND (SELECT COUNT(*) FROM users WHERE role = 'admin' AND COALESCE(active, 1) = 1) <= 1
  BEGIN SELECT RAISE(ABORT, 'Keep at least one active administrator'); END`,
]
export function installAdministratorGuards(databaseURL: string) {
  const db = new DatabaseSync(sqliteFile(databaseURL))
  try { for (const statement of administratorGuards) db.exec(statement) }
  finally { db.close() }
}
