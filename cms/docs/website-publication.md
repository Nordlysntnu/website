# CMS-to-website publication — issue #78

The public website stays a static Next.js export. Publishers approve content in Payload; a separate worker builds a complete website from a private snapshot of published articles. It checks the export and photos before changing the active release. A failed build leaves the active release untouched.

This branch is not deployed. Preview mode is a local test; it cannot activate a live website. Live activation requires production configuration, Linux and a clean main checkout matching the last fetched origin/main. Editors receive no Git, SSH, shell or deployment credentials.

## Local static-build preview

From cms/, after npm ci and npm run setup, add these local-only settings to .env.local:

```dotenv
NORDLYS_PUBLISH_ENABLED=true
NORDLYS_PUBLISH_MODE=preview
NORDLYS_WEBSITE_URL=http://127.0.0.1:4178
```

Run npm run dev, npm run publish:worker and npm run publish:preview in separate terminals. The CMS is at http://127.0.0.1:3010/admin and the generated website at http://127.0.0.1:4178. The first build imports all existing static stories through setup. Subsequent approvals queue an update automatically; refresh the website after its status says the preview is ready. npm run publish:once runs one reconciliation/build and exits nonzero if the requested version is not active.

The static preview serves only the active public export. CMS login, private uploads, snapshots, email and build logs are not served on port 4178. Unlike the development reader on port 3000, this exercises an actual production export and release switch. The public site's ordinary forms are included: do not submit contact/recruitment forms from this static preview, because it uses production website behavior. Use the existing port-3000 laptop mode to simulate those forms.

## Content preservation

Every legacy article has a stable legacyKey in src/shared/data/blog.tsx. npm run import:legacy imports its text, date and photos and records the mapping in a private collection. Repeating the import preserves CMS edits. A deleted or unpublished imported article stays withdrawn; the mapping prevents the old static copy from returning.

A previous, unchanged Belgium demo seed is linked to the original article after checking its text, gallery and actual image bytes (including Payload's standard rotation/re-encoding). Edited seed content fails with a review message; it is not overwritten. Stop the local server and back up an old demo before setup/schema:sync. The additive publication upgrader also creates a SQLite backup, uses a transaction and rejects a partial schema.

Snapshot builds include unmanaged legacy stories until they are imported. After import, Payload is authoritative for those stories. Legacy-key routes are stable and imported articles retain their numeric routes as aliases. Private revisions and review notes never enter the snapshot. Only media referenced by the published copy is copied, under content-hashed public paths. Withdrawing an article is not a way to erase previously public copies from browser caches.

## Jobs and recovery

The durable Payload jobs table coalesces pending website updates. A process lock and exclusive queue prevent concurrent publishers. The worker reconciles current published content and source revision with the active manifest, so a missed hook or interrupted job can be recovered. Retries back off; reconciliation waits five minutes before retrying a repeatedly failed unchanged build. A publisher can request an immediate retry from the dashboard. Raw jobs, internal globals and import mappings are inaccessible through the CMS REST API.

The worker runs only the configured website build command from reviewed source. Job input cannot choose paths or commands. The build runs in private temporary storage without SMTP/Payload credentials in its environment. It checks article routes, positive public data projection and image checksums. If source or approved CMS content changes during a build, the result is rejected. Build logs stay private under CMS_DATA_DIR/publishing/logs.

Keep one CMS HTTP instance and one publishing worker on the same host. The worker is not a second HTTP CMS replica. SQLite WAL/busy-timeout handles their local connections; database/upload backups must stop both services. The process lock is a local-filesystem lock; do not put it, SQLite or releases on shared/network storage.

## VM cutover — requires SSH and separate deployment authorization

1. Inspect RAM, disk, current Nginx root, service account and the self-hosted runner. Building the site adds short CPU/RAM/disk load; verify capacity before enabling the worker. Keep its checkout and dependencies read-only to the running service.
2. Complete the CMS hosting/account steps in production.md. Back up the database, uploads and current website. Apply migrations, then import the nine legacy articles with npm run import:legacy using the reviewed production environment and a clean main checkout. Never seed demo accounts in production.
3. Prepare /var/www/nordlys owned by the service user, with traversable permissions for Nginx. Set the explicit publication paths from .env.production.example. Private CMS storage stays 0700; it is never a web root. Public release files are 0644 and directories 0755.
4. Pause the legacy GitHub deployment workflow during cutover. Its current rsync targets /var/www/nextapp. It must not write into generated releases. The branch adds a guard refusing rsync when that path is a symlink or contains a publication manifest; older workflow runs must also be stopped.
5. Keep Nginx serving the old site while running the first live build with NORDLYS_PUBLISH_ACTIVE=/var/www/nordlys/current. Inspect the generated /blog, home page, article aliases and images. The worker refuses to replace an existing directory or an unknown symlink.
6. Review and change the existing Nginx root to /var/www/nordlys/current, keeping the old /var/www/nextapp directory for rollback. Keep the static-export try_files rule ($uri $uri.html $uri/ =404). Test nginx -t before reloading. Add a guard/disable the old rsync deployment before resuming any automation.
7. Install the reviewed nordlys-publisher.service alongside nordlys-cms.service. Enable automatic publication only after validation and explicit deployment approval. Website source updates are a separate reviewed main checkout/install operation; the worker never pulls, commits, pushes or merges Git. A clean main revision change triggers a new export on the next reconciliation.
8. Run the full acceptance flow against the VM, verify build failures preserve the site, and rehearse restoration of a retained release. Record the final Nginx paths and ownership for the next team.

The VM template requires path/permissions review. Nothing here changes repository protection or directly deploys a branch.

## Retention and rollback

The current release and two previous validated releases are retained. An unsuccessful build is never activated. Releases have a public publication.json containing the revision/hash, timestamp, article count and asset checksums; no account or draft information.

For an operational rollback, stop the publisher first so reconciliation cannot immediately restore newer content. With the approved environment loaded, use npm run publish:rollback -- RELEASE_ID to verify and activate a retained release. It refuses unknown targets and existing website directories. Automatic publication stays paused until the operator restarts the worker; restarting it will reconcile to the current approved CMS content. Restoring older content can re-expose articles that were later withdrawn, so select the intended release deliberately.

After an abnormal process termination, inspect private publishing/work for abandoned build directories and remove only the recorded failed build paths while the worker is stopped. Private build logs are not automatically rotated. Integrate their retention and disk monitoring with VM operations. Database/uploads need separate off-VM backups; retained website releases are not a database backup.

## Validation

npm run test:publication covers an existing SQLite upgrade/backup, repeated imports, preserved edits, private revisions, access controls, queue recovery, failed/corrupt exports, withdrawal, release switching and the local HTTP preview. Linux additionally tests atomic live symlinks on disposable fixtures.

npm run test:browser creates an isolated migrated database, two disposable accounts and all nine legacy articles. Chromium tests desktop/mobile themes, a real invitation/password setup, writer/reviewer feedback and resubmission, real static export, the public article/home page and retention of the public copy during a private revision. It uses only a local email outbox. Reports/screenshots stay in the ignored data directory recorded in .local/browser/last-run.json.

VM capacity, Nginx/TLS, real mail, real accounts, 2FA and off-VM restore remain launch work. Local passing tests do not validate those external services.
