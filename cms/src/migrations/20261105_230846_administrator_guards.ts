import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-sqlite'
const statements = [
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
export async function up({db}: MigrateUpArgs) { for(const statement of statements) await db.run(sql.raw(statement)) }
export async function down({db}: MigrateDownArgs) {
 await db.run(sql.raw('DROP TRIGGER IF EXISTS users_keep_last_admin_update'))
 await db.run(sql.raw('DROP TRIGGER IF EXISTS users_keep_last_admin_delete'))
}
