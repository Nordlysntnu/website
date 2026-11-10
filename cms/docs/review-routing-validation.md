# Reviewer routing increment - 2026-11-02

Scope: selected reviewer with shared-queue fallback, private in-app notifications and a personal My articles page. Member invitations/administrator management, image improvements and scheduled publication remain in the README backlog. Google Workspace sign-in remains deferred.

## Verified

- Type generation completed; TypeScript check passed.
- test:api passed: 6 tests, 0 failures, 0 skipped. These call the actual Payload REST handlers, authentication, access rules, hooks and SQLite directly without opening a network port.
- Covered selected-reviewer recipient filtering with two publishers, reassignment, shared-queue recipients, owner feedback/publication notifications, forged ownership/events/read receipts, invalid reviewers, anonymous rejection, draft isolation and private public API metadata.
- Disposable articles and the additional reviewer were deleted. The previous writer notification read receipt was restored.
- Compared all original columns and rows against the pre-upgrade backup: 4 posts, 11 post versions, 6 gallery rows, 7 version-gallery rows and 6 media records are unchanged.
- Git diff whitespace check passed. No dependencies were added.

## Pending verification

- The full production build did not pass. The terminal runner fails to locate its PowerShell runtime. A direct local Webpack build reached compilation but reported EPERM on the drive root and could not resolve existing source aliases.
- Running-server HTTP tests in workflow.test.ts, including the new My articles/assigned-review page checks, were not run successfully. The alternative environment rejected loopback requests and failed to start the listening server.
- No successful browser or mobile visual review was obtained. Type/API checks do not establish visual correctness.

## Local data and rollout

The server was not running when a backup was taken under .local/backups/before-review-routing-2026-11-02-*.db. The explicit upgrade adds only nullable columns to posts, versions and users; it does not seed or assign ownership to old posts. Database files, credentials, uploads and local logs remain excluded from Git.

No push, merge, production access or deployment was performed.
