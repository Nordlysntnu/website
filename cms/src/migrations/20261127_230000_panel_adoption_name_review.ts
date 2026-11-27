import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`panel_adoptions\` ADD \`name_review\` text DEFAULT 'pending' NOT NULL;`)
  await db.run(sql`ALTER TABLE \`panel_adoptions\` ADD \`name_flags\` text;`)
  await db.run(sql`CREATE INDEX \`panel_adoptions_name_review_idx\` ON \`panel_adoptions\` (\`name_review\`);`)
  // Existing orders: no name needs no review, and a name an administrator already hid stays hidden.
  await db.run(sql`UPDATE \`panel_adoptions\` SET \`name_review\` = 'none' WHERE \`display_name\` IS NULL OR \`display_name\` = '';`)
  await db.run(sql`UPDATE \`panel_adoptions\` SET \`name_review\` = 'hidden' WHERE \`name_review\` = 'pending' AND \`show_name\` = 0;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`panel_adoptions_name_review_idx\`;`)
  await db.run(sql`ALTER TABLE \`panel_adoptions\` DROP COLUMN \`name_review\`;`)
  await db.run(sql`ALTER TABLE \`panel_adoptions\` DROP COLUMN \`name_flags\`;`)
}
