import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

// Shared with the explicit local upgrader; only additive SQL is applied.
export const publicationStatements: string[] = [
  "CREATE TABLE legacy_imports (id integer PRIMARY KEY NOT NULL, key text NOT NULL, post_id numeric NOT NULL, updated_at text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL, created_at text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL);",
  "CREATE UNIQUE INDEX legacy_imports_key_idx ON legacy_imports (key);",
  "CREATE INDEX legacy_imports_updated_at_idx ON legacy_imports (updated_at);",
  "CREATE INDEX legacy_imports_created_at_idx ON legacy_imports (created_at);",
  "CREATE TABLE payload_jobs (id integer PRIMARY KEY NOT NULL, input text, completed_at text, total_tried numeric DEFAULT 0, has_error integer DEFAULT false, error text, task_slug text, queue text DEFAULT 'default', wait_until text, processing integer DEFAULT false, concurrency_key text, updated_at text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL, created_at text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL);",
  "CREATE TABLE payload_jobs_log (_order integer NOT NULL, _parent_id integer NOT NULL, id text PRIMARY KEY NOT NULL, executed_at text NOT NULL, completed_at text NOT NULL, task_slug text NOT NULL, task_i_d text NOT NULL, input text, output text, state text NOT NULL, error text, FOREIGN KEY (_parent_id) REFERENCES payload_jobs(id) ON UPDATE no action ON DELETE cascade);",
  "CREATE INDEX payload_jobs_log_order_idx ON payload_jobs_log (_order);",
  "CREATE INDEX payload_jobs_log_parent_id_idx ON payload_jobs_log (_parent_id);",
  "CREATE INDEX payload_jobs_completed_at_idx ON payload_jobs (completed_at);",
  "CREATE INDEX payload_jobs_total_tried_idx ON payload_jobs (total_tried);",
  "CREATE INDEX payload_jobs_has_error_idx ON payload_jobs (has_error);",
  "CREATE INDEX payload_jobs_task_slug_idx ON payload_jobs (task_slug);",
  "CREATE INDEX payload_jobs_queue_idx ON payload_jobs (queue);",
  "CREATE INDEX payload_jobs_wait_until_idx ON payload_jobs (wait_until);",
  "CREATE INDEX payload_jobs_processing_idx ON payload_jobs (processing);",
  "CREATE INDEX payload_jobs_concurrency_key_idx ON payload_jobs (concurrency_key);",
  "CREATE INDEX payload_jobs_updated_at_idx ON payload_jobs (updated_at);",
  "CREATE INDEX payload_jobs_created_at_idx ON payload_jobs (created_at);",
  "CREATE TABLE website_publication (id integer PRIMARY KEY NOT NULL, applied_hash text, release_id text, succeeded_at text, failed_at text, failed_hash text, error text, mode text, updated_at text, created_at text);",
  "ALTER TABLE posts ADD legacy_key text;",
  "CREATE UNIQUE INDEX posts_legacy_key_idx ON posts (legacy_key);",
  "ALTER TABLE _posts_v ADD version_legacy_key text;",
  "CREATE INDEX _posts_v_version_version_legacy_key_idx ON _posts_v (version_legacy_key);",
  "ALTER TABLE media ADD legacy_source text;",
  "CREATE UNIQUE INDEX media_legacy_source_idx ON media (legacy_source);",
  "ALTER TABLE payload_locked_documents_rels ADD legacy_imports_id integer REFERENCES legacy_imports(id);",
  "CREATE INDEX payload_locked_documents_rels_legacy_imports_id_idx ON payload_locked_documents_rels (legacy_imports_id);"
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.transaction(async transaction => {
    for (const statement of publicationStatements) await transaction.run(sql.raw(statement))
  }, { behavior: 'immediate' })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`legacy_imports\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs_log\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs\`;`)
  await db.run(sql`DROP TABLE \`website_publication\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`order\` integer,
    \`parent_id\` integer NOT NULL,
    \`path\` text NOT NULL,
    \`users_id\` integer,
    \`posts_id\` integer,
    \`media_id\` integer,
    FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "posts_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "posts_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`DROP INDEX \`posts_legacy_key_idx\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`legacy_key\`;`)
  await db.run(sql`DROP INDEX \`_posts_v_version_version_legacy_key_idx\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_legacy_key\`;`)
  await db.run(sql`DROP INDEX \`media_legacy_source_idx\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`legacy_source\`;`)
}
