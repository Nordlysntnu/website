import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

// Shared with the explicit local upgrader (scripts/prepare-mfa-schema.ts); additive only.
export const twoFactorColumns: [name: string, type: string][] = [
  ['totp_enabled_at', 'text'], ['totp_secret', 'text'], ['totp_pending_secret', 'text'],
  ['totp_last_step', 'numeric'], ['totp_failures', 'numeric'], ['totp_locked_until', 'text'], ['mfa_session_ids', 'text'],
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [name, type] of twoFactorColumns) await db.run(sql.raw(`ALTER TABLE \`users\` ADD \`${name}\` ${type};`))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [name] of twoFactorColumns) await db.run(sql.raw(`ALTER TABLE \`users\` DROP COLUMN \`${name}\`;`))
}
