import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`panel_adoptions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`reference\` text NOT NULL,
  	\`status\` text DEFAULT 'pending' NOT NULL,
  	\`panels\` text NOT NULL,
  	\`panel_count\` numeric NOT NULL,
  	\`amount\` numeric NOT NULL,
  	\`display_name\` text,
  	\`show_name\` integer DEFAULT true,
  	\`vipps_state\` text,
  	\`expires_at\` text NOT NULL,
  	\`paid_at\` text,
  	\`client\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`panel_adoptions_reference_idx\` ON \`panel_adoptions\` (\`reference\`);`)
  await db.run(sql`CREATE INDEX \`panel_adoptions_status_idx\` ON \`panel_adoptions\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`panel_adoptions_expires_at_idx\` ON \`panel_adoptions\` (\`expires_at\`);`)
  await db.run(sql`CREATE INDEX \`panel_adoptions_client_idx\` ON \`panel_adoptions\` (\`client\`);`)
  await db.run(sql`CREATE INDEX \`panel_adoptions_updated_at_idx\` ON \`panel_adoptions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`panel_adoptions_created_at_idx\` ON \`panel_adoptions\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`panel_adoptions_id\` integer REFERENCES panel_adoptions(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_panel_adoptions_id_idx\` ON \`payload_locked_documents_rels\` (\`panel_adoptions_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`panel_adoptions\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`posts_id\` integer,
  	\`media_id\` integer,
  	\`legacy_imports_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`legacy_imports_id\`) REFERENCES \`legacy_imports\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "posts_id", "media_id", "legacy_imports_id") SELECT "id", "order", "parent_id", "path", "users_id", "posts_id", "media_id", "legacy_imports_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_legacy_imports_id_idx\` ON \`payload_locked_documents_rels\` (\`legacy_imports_id\`);`)
}
