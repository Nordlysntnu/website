# CMS v0.1 hosting and accounts — issue #78

This is a deployment preparation guide. Nothing in this branch provisions the VM, changes DNS, sends production mail or enables CMS-to-website publication automatically.

## Runtime choice

Use the existing NTNU OpenStack VM. Keep the static public website and CMS separate. The supplied systemd unit is a proposed service for an ordinary Linux VM; use it after inspecting the current server. If the VM already uses containers, adapt the service instead of installing a second orchestration stack.

v0.1 uses SQLite with WAL, a five-second busy timeout and **one CMS HTTP instance and one separate local publication worker**. This avoids a separate database service for a small editorial team. Do not put the database on a shared/network filesystem or run replicas against it. CPU/RAM/disk capacity still needs checking on the VM. Build outside the serving process when possible.

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

Google Workspace sign-in is deferred.

### Two-factor sign-in (2FA)

Production always requires an authenticator-app code (TOTP, RFC 6238) for every sign-in session. After the password, members see a two-factor screen: first time they scan a QR code (or type the key) into an authenticator app, then they enter a six-digit code. Until a session passes, it cannot read or change any content, accounts or publishing; it can only load its own account and the 2FA endpoints.

- Secrets are encrypted at rest (AES-256-GCM, key derived from PAYLOAD_SECRET) and never returned by the API. Changing PAYLOAD_SECRET invalidates all enrolled authenticators.
- Codes are single-use within their 30-second window. Five wrong codes lock verification for five minutes.
- A member cannot replace an enrolled authenticator themselves. An administrator uses **Reset two-factor sign-in** on the account page; this also signs the member out.
- If the last administrator loses their phone, an operator runs `npm run 2fa:reset -- address@example.org` on the VM with the production environment loaded.
- Locally, 2FA is off unless CMS_REQUIRE_2FA=true. `npm run test:mfa` covers the flow.

### Without an SMTP relay

Set CMS_EMAIL_MODE=manual. No mail is sent. Invitations and Resend show the administrator a one-hour setup link to pass on through a private channel; `npm run bootstrap:admins` prints the links to the operator's terminal (do not save that output). Switch to SMTP by filling SMTP_* and removing CMS_EMAIL_MODE; Forgot password only works with SMTP.

## Deployment order (after SSH / DNS access is available)

1. Inspect the VM, current Nginx or other proxy, current GitHub runner, Node version, capacity and existing website deployment. Preserve the existing site's configuration.
2. Use a dedicated unprivileged service account. Install a supported Node runtime (this branch uses Node >=24.22.1). Install dependencies and build the CMS with npm ci and npm run build from cms/. Build needs dev dependencies; retain the runtime dependencies and compiled output afterwards.
3. Generate a production PAYLOAD_SECRET and fill in .env.production.example as /etc/nordlys-cms.env. Restrict it to the service administrator. It is not part of Git or the app's public files.
4. Create the external data directory with mode 0700 and assign it to the CMS service user. Use umask 0077 for migration/bootstrap commands. Apply the checked-in migrations using npm run db:migrate with the reviewed production environment loaded. Then inspect npm run db:status. The initial migration targets a fresh production database. **Do not apply it blindly to an existing demo DB**; the explicit local upgrader preserves that separate schema.
5. Configure CMS_BOOTSTRAP_ADMINS with the two confirmed name/email entries and run npm run bootstrap:admins as an authorized operator. This is a privileged offline operation, not an HTTP endpoint. It creates accounts with random unknown passwords and sends setup links. It will not silently promote or reactivate existing non-admin accounts. Remove the bootstrap variable afterwards.
6. Build/install the systemd service only after adjusting paths and checking that the cache directory exists and is writable. It runs npm run start, never next dev. Check /api/health and logs on loopback.
7. Create cms.nordlysntnu.no DNS and HTTPS certificates, then adapt nginx-cms.conf.example to the existing webserver. Check nginx -t before reloading. CMS port 3010 stays private. Apply the server's existing login/API rate limits.
8. Test login with 2FA, invitations, author isolation, reviewer queue and deactivation in a browser. Confirm the two administrators can sign in. With SMTP, confirm actual emails arrive and password recovery works.

The production env file uses systemd EnvironmentFile syntax (no shell export statements). For one-off migration/bootstrap commands, inject the same variables using your approved deployment/secret mechanism; do not paste secrets into shell history or use source on an unreviewed file.

## Backups and restore

The backup tool uses SQLite's backup API, integrity checking and SHA-256 checksums. Stop both the CMS and publishing worker during backup so the database and uploads represent one consistent editorial state.

1. Stop the CMS and publisher services.
2. Run npm run backup -- /new/backup/location --stopped with CMS_DATA_DIR set.
3. Restart both services after investigating any backup failure.
4. Copy/encrypt the resulting protected backup outside the VM. Choose the destination, schedule and retention with the server owner. This branch does not schedule jobs or upload data.
5. Keep the production environment/secrets separately in your approved secret store.

### Nightly backups and off-VM copies

deploy/nordlys-cms-backup.service + .timer run deploy/backup-run.sh at 03:30 Oslo time. The service stops the CMS (and publisher) for a few seconds, writes a checked backup to /var/backups/nordlys-cms/<UTC time>, keeps the newest 14 and starts the services again, also after a failure. Check with `systemctl list-timers nordlys-cms-backup.timer` and `journalctl -u nordlys-cms-backup`.

Off-VM copies: on the administrator PC, with the Nordlys SSH key loaded, run `bash cms/scripts/pull-backup.sh` in Git Bash. It downloads the newest backup, encrypts it with your passphrase (AES-256, PBKDF2), proves it decrypts, and keeps 30 copies in ~/NordlysBackups/cms (outside the synced vault). Store the passphrase in the password manager. Run it at least weekly.

To use an off-VM copy: `openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 -in FILE.tar.gz.enc | tar -xzf -`, copy the folder to the VM, then restore as below.

Restore while both services are stopped: npm run restore -- /backup/location /new/data/location --stopped. It checks all listed checksums and database integrity and refuses to overwrite an existing directory. Review ownership and point CMS_DATA_DIR (and DATABASE_URL, if explicitly configured) at the restored location before starting. Test this procedure on the VM before launch. Restoring the DB and uploads does not restore DNS, certificates, application code or secrets.

## Publishing and remaining rollout gates

The durable publisher, nine-article import, status feedback and retained releases are implemented on the cms branch. They remain disabled on the VM until a separately authorized cutover. Read [website-publication.md](website-publication.md) before enabling NORDLYS_PUBLISH_ENABLED. It covers the clean-main source requirement, public/private paths, old rsync guard, first build, Nginx switch and rollback. A successful CMS save is distinct from a successful static website update; use the publication status.

Remaining gates: approved SMTP delivery, a VM restore drill and actual live publishing validation (cutover from the old rsync deploy). Source/SQLite/browser tests do not prove those external services. No team/sponsor editing or LinkedIn integration is included.
