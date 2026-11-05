# CMS v0.1 hosting and accounts — issue #78

This is a deployment preparation guide. Nothing in this branch provisions the VM, changes DNS, sends production mail or enables CMS-to-website publication automatically.

## Runtime choice

Use the existing NTNU OpenStack VM. Keep the static public website and CMS separate. The supplied systemd unit is a proposed service for an ordinary Linux VM; use it after inspecting the current server. If the VM already uses containers, adapt the service instead of installing a second orchestration stack.

v0.1 uses SQLite with WAL, a five-second busy timeout and **one CMS process/instance**. This avoids a separate database service for a small editorial team. Do not put the database on a shared/network filesystem or run replicas against it. CPU/RAM/disk capacity still needs checking on the VM. Build outside the serving process when possible.

Keep application releases under /opt/nordlys/website, with data under /var/lib/nordlys-cms:
- cms.db (plus SQLite-managed WAL/SHM files)
- uploads/
- local-only outbox/ when testing

Production configuration requires HTTPS, a long secret, an absolute external data directory, a database inside that directory, and an SMTP host. It rejects development schema push. Start on 127.0.0.1:3010 behind the current HTTPS reverse proxy.

## Accounts

Approved first administrators: **Can Arif Oraz and Tobias Johnsen Skånseng**. Confirm their email addresses before running bootstrap. The repository contains no real passwords or provisioned production accounts.

- Writer (stored role marketing, retained for compatibility): write/read own drafts, upload own photos, submit for review.
- Publisher: shared review queue, feedback, edit and publish.
- Administrator: publisher permissions plus invitations, roles and account deactivation.

Accounts are invitation-only, including when the database is empty. Public first-user registration is blocked. Administrators invite from Accounts. Recipients set their own password with Payload's one-hour reset token. Reusing or using an expired token fails. Passwords need at least 12 characters. The standard Forgot password page provides recovery.

Only administrators can change roles/activation. Role changes and deactivation end existing sessions. Disabled accounts cannot log in or reset into an authenticated session. Accounts are deactivated instead of deleted to preserve authorship. Database triggers preserve an active administrator even for concurrent changes.

Writers cannot read or alter other writers' drafts, revisions or unpublished uploads. Publishers and administrators can collaborate. Existing unowned demo drafts/uploads are visible to publishers, not automatically assigned to a member. Public published copies and their images remain public.

Local email is saved only in the ignored private .local/outbox directory. Production uses the approved SMTP relay with TLS, through @payloadcms/email-nodemailer. There is no test-email provider fallback. Verify real delivery before inviting members. Never expose the data directory through Nginx.

Google Workspace sign-in is deferred. **2FA from issue #78 is still a launch requirement to resolve**; password-only account administration is not a 2FA implementation or a completed security review.

## Deployment order (after SSH / DNS access is available)

1. Inspect the VM, current Nginx or other proxy, current GitHub runner, Node version, capacity and existing website deployment. Preserve the existing site's configuration.
2. Use a dedicated unprivileged service account. Install a supported Node runtime (this branch uses Node >=24.22.1). Install dependencies and build the CMS with npm ci and npm run build from cms/. Build needs dev dependencies; retain the runtime dependencies and compiled output afterwards.
3. Generate a production PAYLOAD_SECRET and fill in .env.production.example as /etc/nordlys-cms.env. Restrict it to the service administrator. It is not part of Git or the app's public files.
4. Create the external data directory with mode 0700 and assign it to the CMS service user. Use umask 0077 for migration/bootstrap commands. Apply the checked-in migrations using npm run db:migrate with the reviewed production environment loaded. Then inspect npm run db:status. The initial migration targets a fresh production database. **Do not apply it blindly to an existing demo DB**; the explicit local upgrader preserves that separate schema.
5. Configure CMS_BOOTSTRAP_ADMINS with the two confirmed name/email entries and run npm run bootstrap:admins as an authorized operator. This is a privileged offline operation, not an HTTP endpoint. It creates accounts with random unknown passwords and sends setup links. It will not silently promote or reactivate existing non-admin accounts. Remove the bootstrap variable afterwards.
6. Build/install the systemd service only after adjusting paths and checking that the cache directory exists and is writable. It runs npm run start, never next dev. Check /api/health and logs on loopback.
7. Create cms.nordlysntnu.no DNS and HTTPS certificates, then adapt nginx-cms.conf.example to the existing webserver. Check nginx -t before reloading. CMS port 3010 stays private. Apply the server's existing login/API rate limits.
8. Test login, invitations, password recovery, author isolation, reviewer queue and deactivation in a browser. Confirm the two administrators can sign in and actual emails arrive. Complete the remaining 2FA decision before broader rollout.

The production env file uses systemd EnvironmentFile syntax (no shell export statements). For one-off migration/bootstrap commands, inject the same variables using your approved deployment/secret mechanism; do not paste secrets into shell history or use source on an unreviewed file.

## Backups and restore

The backup tool uses SQLite's backup API, integrity checking and SHA-256 checksums. Stop the CMS during backup so the database and uploads represent one consistent editorial state.

1. Stop the CMS service.
2. Run npm run backup -- /new/backup/location --stopped with CMS_DATA_DIR set.
3. Restart the service even if a backup operation fails, after investigating the failure.
4. Copy/encrypt the resulting protected backup outside the VM. Choose the destination, schedule and retention with the server owner. This branch does not schedule jobs or upload data.
5. Keep the production environment/secrets separately in your approved secret store.

Restore while the CMS is stopped: npm run restore -- /backup/location /new/data/location --stopped. It checks all listed checksums and database integrity and refuses to overwrite an existing directory. Review ownership and point CMS_DATA_DIR (and DATABASE_URL, if explicitly configured) at the restored location before starting. Test this procedure on the VM before launch. Restoring the DB and uploads does not restore DNS, certificates, application code or secrets.

## Publishing and remaining rollout gates

Publishing currently updates the CMS blog. The public site's production build still uses its existing static blog data. The laptop preview integration remains available. A durable production publishing worker, preservation/import of all existing posts, build status feedback and rollback still need implementation and end-to-end verification. Do not describe a successful CMS publication as a deployed website update.

Other remaining gates: production build + browser checks on an unrestricted host/CI, SSH capacity inspection, DNS/TLS, approved SMTP delivery, first accounts, 2FA, off-VM backup destination/retention and restore drill. No team/sponsor editing or LinkedIn integration is included.
