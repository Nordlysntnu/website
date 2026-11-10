# Test the website and CMS on your laptop

This runs both applications on the laptop. It works on a different network from the current computer and from NTNU OpenStack. No push, main-branch update, remote server access, VPN, port forwarding or deployment is needed.

## Get the cms branch or a portable source copy

For the latest pushed source, use a normal Git clone/checkout of the cms branch of Nordlysntnu/website. Keep main unchanged.

For a portable copy, on the computer holding this checkout run npm run local:package from the repository root. Copy .local/portable/nordlys-local-test.zip to the laptop and extract it into a new folder.

The source snapshot includes uncommitted work and public website assets. It excludes Git history, node_modules, builds, local CMS database/uploads, secrets and demo credentials. It is a standalone test copy, not a Git clone. A portable ZIP can include local edits that have not yet been pushed.

## First setup on the laptop (Windows PowerShell)

Install Node.js/npm first (Node 24.22.1 or a newer compatible version is recommended). Open PowerShell in the extracted project root and run:

~~~powershell
npm ci
npm --prefix cms ci
npm run local:setup
npm run local:check
npm run local:dev
~~~

The two dependency installations are separate because the website and CMS use different React versions. Do not move or combine their node_modules folders. npm uses the lockfiles. The CMS installation also supplies the project-local Node runtime used to start both services.

local:setup creates a fresh local database, three random demo logins and all nine legacy articles. Read cms/.local/Demo-login.md locally; do not paste its passwords into Git or messages. Setup preserves existing accounts/content. Stop both servers and back up cms/.local and cms/.env.local before running setup on an existing test copy.

Internet is needed to install dependencies and may be needed for fonts or embedded third-party content. The apps do not need the current computer or NTNU network to remain reachable.

## Open the two applications

- Full website: http://127.0.0.1:3000
- CMS: http://127.0.0.1:3010/admin
- Personal article overview: http://127.0.0.1:3010/my-posts

The launcher binds both services to loopback, checks the ports first and starts the website after the CMS responds. Keep its terminal open. Ctrl+C stops both services, including their child processes. Subsequent runs only need npm run local:dev. If a port is occupied, stop the other local dev server; the launcher does not kill an existing service or silently select another port.

## Test the complete local editorial flow

1. Open the website and CMS in separate tabs. The website has a LOCAL TEST banner.
2. Sign in as Marketing (writer), create a new article, add text/photos and choose a responsible reviewer. Unsaved drafts are visible only in the CMS preview.
3. Confirm that the draft is absent from the website home page, /blog and /blog/ARTICLE_ID. The regular local website requests published content without a login token, even when your browser is signed in to the CMS.
4. Send for review. Sign in as Leader and check Assigned to you, the shared queue and Notifications.
5. Request changes, then sign back in as the writer. Check feedback/notifications, revise and resubmit.
6. As Leader, publish. Refresh the website: the article should appear in the blog and, if its post date is newest, on the home page. Open its article URL and check cover/body/gallery photos and captions.
7. Save another private revision as the writer. Refresh the website: the previous published copy should remain. Publish that revision as Leader and refresh again.
8. Unpublish the test article and refresh the website: its card and article page should disappear.
9. Test contact/recruitment form validation. Valid submission shows Local test complete - nothing was sent. In this explicit local mode the Google form endpoints are bypassed and Analytics is disabled. This does not test real email/form delivery.

The local website reader connects only to the fixed loopback CMS on port 3010. It projects public fields and supported rich-text blocks into the existing website layout. It never forwards session cookies or an editor JWT. Images are served by the local CMS, so keep it running while browsing.

## Isolation and current limits

- npm run dev without the local launcher keeps the original website content source. Production builds also retain the existing static content source, even if the local preview flag is accidentally set.
- Local mode uses .next-local for the website and has no deployment command. The CMS database is cms/.local/cms.db; no production database is used.
- No OpenStack publishing job is exercised. To test the actual static build/activation pipeline locally from a Git checkout, use [the port-4178 publication preview](../cms/docs/website-publication.md). The portable ZIP has no Git history, so it uses the port-3000 development reader.
- Local invitations/password recovery are available through Accounts; email stays in the private outbox. Google Workspace sign-in, production mail verification, improved image handling and scheduled publication remain later work.
- The laptop gets its own fresh test content. Existing edits on the first computer are not carried in the ZIP.

## Checks and evidence

~~~powershell
npm run test:local
npm --prefix cms run test:api
npm --prefix cms run typecheck
~~~

The cms branch also includes isolated account, publication and Chromium browser suites. See cms/README.md and cms/docs/website-publication.md for commands and the current evidence boundary. Local checks do not validate VM hosting, real email or form delivery.
