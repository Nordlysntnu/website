# Nordlys CMS — v0.1 development (issue #78)

Payload CMS for writing articles, review and publication. This branch includes invitation-managed accounts, private drafts/review, dark/light mode and a durable CMS-to-static-website publisher. It is not deployed.

The CMS is kept in the website repository. The agreed destination is a separate service on the same NTNU OpenStack VM, proposed at https://cms.nordlysntnu.no/admin. The existing public website remains static. The publisher is disabled until the reviewed VM cutover. Local preview mode cannot change the public website.

## Local setup

Use Node >=24.22.1. From cms/:

```sh
npm ci
npm run setup
npm run dev
```

Open http://127.0.0.1:3010/admin. Setup creates or preserves local demo accounts (writer, publisher and administrator), a random local secret, SQLite and practice content, and imports all nine existing website articles. The private .local/Demo-login.md contains the local sign-in details. Passwords are not reset when setup is repeated. Repeated legacy imports preserve CMS edits and do not restore deleted/unpublished articles.

Database, uploads, local email and passwords stay in the ignored .local directory. Never use demo setup/seed in production. Back up .local and the local environment file if preserving demo edits.

The full laptop website+CMS flow is documented in ../docs/local-laptop-test.md. Root npm run local:dev starts the website on 127.0.0.1:3000 and the CMS on 127.0.0.1:3010. The explicit preview mode reads published CMS content and simulates forms; ordinary production website builds still use the existing static blog data.

## Accounts and editorial workflow

| Role | Capabilities |
| --- | --- |
| Writer (stored role marketing) | Own drafts/uploads, preview, submit/resubmit and read own feedback. |
| Publisher | Shared review queue, feedback, editing, publishing and protected media management. |
| Administrator | Publisher access plus invitations, roles and account deactivation. |

Can Arif Oraz and Tobias Johnsen Skånseng are the approved first production administrators. Their accounts are not created by demo setup. Confirm addresses and use the offline bootstrap procedure in docs/production.md.

Administrators open Accounts to invite a member. The member receives a one-hour password setup link. The account page can resend it; Forgot password supports recovery. Passwords require at least 12 characters. Role changes and deactivation revoke current sessions. There is no public registration, including for an empty database. Deactivation preserves authored content; the database atomically protects the last active administrator.

Local email is saved to .local/outbox/*.json instead of being sent. These private files contain reset links; do not serve or commit them. Production uses an explicitly configured SMTP relay with TLS. SMTP delivery and 2FA still need completion/verification before public rollout. Google Workspace login remains deferred.

Writers can create an article, choose a responsible reviewer or the shared queue, preview, and send for review. A selected reviewer does not prevent other publishers from helping. Publishers request changes with a private note or publish. The author receives in-app feedback/publication notifications. Autosaves do not repeatedly notify.

My articles shows ownership, status, reviewer, latest feedback and the next action. Unlike the earlier prototype, writers cannot edit/read another writer's private drafts, versions or unpublished photos. Existing demo content without an owner remains available to publishers; it is not assigned to the first person who edits it.

Published copies remain unchanged while a revision is private. Anonymous users receive published content/photos only, without review notes, receipts or account details. Draft previews use the same article renderer and require access. Ownership/notification receipts are server-generated.

## Appearance and writing

Dark is the default, regardless of OS preference. Light mode is available through the visible theme button and Payload's appearance control. The choice is remembered in the Payload theme cookie across the CMS pages. Public website styling is unchanged.

Article starters, title/body checks, live preview, inline photos/captions, alt text, gallery, search and group/year filters are retained. Existing display choices are preserved. Cover cropping, more image metadata/compression and scheduled publishing remain later increments; Post date is a display date.

## Database and deployment

SQLite with WAL and one CMS instance is selected for v0.1. Database and uploads must live outside the release directory; backups belong outside the VM. The checked-in initial Payload migration creates a fresh production database. A second migration adds atomic last-administrator guards; a third adds the publishing queue, status and legacy mappings.

For an existing local prototype database, stop the server and back it up before npm run schema:sync. The explicit additive local upgrader preserves existing editorial fields, adds account/media ownership fields and installs guards. The publication upgrade also saves a SQLite backup before its atomic additions and rejects partially applied schemas. Do not run the initial production migration blindly against the old demo schema.

See docs/production.md, deploy/nordlys-cms.service, deploy/nginx-cms.conf.example and .env.production.example. The templates require inspection of the real VM and are not installed automatically. Runtime configuration rejects public origins in local mode, unsafe production URLs, short production secrets, schema push and data inside the application release. It expects an approved SMTP relay.

## Website publication

The separate worker builds a public-only snapshot in private work storage, validates the actual export and image checksums, then atomically switches the active release. Failed builds retain the last active version. A dashboard status and publisher retry button show progress. Durable jobs, coalescing, process locking and reconciliation cover missed requests/restarts. The current release and two previous releases are retained; a verified operator rollback command is included.

See [website-publication.md](docs/website-publication.md) for local port-4178 testing, legacy imports, VM cutover, old-deploy coordination and rollback. This static build preview requires a real Git checkout. Production requires a clean main checkout and does not bypass GitHub protection. Nothing pulls, pushes, merges or deploys automatically from an editor request.

## Validation

```sh
npm run test:accounts
npm run test:api
npm run test:runtime
npm run test:storage
npm run test:publication
npm run test:browser
npm run typecheck
npm run build
```

Account tests create a new isolated SQLite database under .local/tests, apply/reapply real migrations, and call Payload REST handlers. They cover invitation-only registration, setup/reset tokens, password validation, role escalation, session revocation, draft/version/photo isolation, publishing and concurrent last-admin protection. Editorial tests use the local demo accounts and preserve their prior notification read receipt. Storage tests restore a disposable DB and image and reject corrupted/unsafe backups. No production mail is sent.

The older npm test suite additionally requires a running local Next.js server and tests page rendering. The CMS checks workflow runs the serverless suites, both production builds, website regressions and real Chromium workflow tests on Linux. Browser tests use a separate migrated database and local email; they do not touch your demo edits or send real invitations. Install Chromium first with npx playwright install chromium (Linux CI also installs browser OS dependencies).

## Remaining launch work

- SSH capacity inspection, DNS/HTTPS, SMTP delivery and first real accounts.
- 2FA required by issue #78; current password sign-in is not 2FA.
- Off-VM backup destination/schedule/retention and a VM restore drill.
- Inspect and authorize the VM publishing cutover, including disabling the old rsync deployment.
- Review dependency advisories and record the production access/security checks.

Team/sponsor editing, Google Workspace SSO, scheduled articles and LinkedIn publication are not implemented in this increment.
