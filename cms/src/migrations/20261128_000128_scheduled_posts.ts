import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`posts\` ADD \`publish_at\` text;`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`scheduled_by\` numeric;`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`scheduled_by_name\` text;`)
  await db.run(sql`CREATE INDEX \`posts_publish_at_idx\` ON \`posts\` (\`publish_at\`);`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_publish_at\` text;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_scheduled_by\` numeric;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_scheduled_by_name\` text;`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_publish_at_idx\` ON \`_posts_v\` (\`version_publish_at\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`posts_publish_at_idx\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`publish_at\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`scheduled_by\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`scheduled_by_name\`;`)
  await db.run(sql`DROP INDEX \`_posts_v_version_version_publish_at_idx\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_publish_at\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_scheduled_by\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_scheduled_by_name\`;`)
}
