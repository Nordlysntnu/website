# CMS publication validation — 6 November 2026

Scope: the cms branch increment for issue #78. This records local source/runtime evidence; it is not a production deployment or a completed launch/security review.

## Completed checks

| Check | Result |
| --- | --- |
| Account/invitation/access REST suite | 13 passed |
| Editorial routing/feedback REST suite | 6 passed |
| Runtime and theme suite | 4 passed |
| Offline backup/restore suite | 1 passed |
| Publication/import/recovery suite | 16 passed; 1 Linux-only symlink test skipped on Windows |
| Website regressions | 35 passed |
| Actual ordinary website export smoke tests | 4 passed |
| CMS production build | Passed with webpack |
| Ordinary static website production build | Passed with Turbopack |
| CMS TypeScript | Passed |
| Chromium desktop/mobile theme and full editorial suite | 2 passed |
| Targeted workflow/contrast rerun after visual correction | Passed |
| Git diff whitespace check | Passed |

The browser run created an isolated migrated SQLite database, imported all nine legacy stories, invited a disposable writer through the real account screen, consumed a local password email, signed in with the chosen password, wrote and autosaved an article, routed review, requested changes, resubmitted and published through the UI. A real worker produced and activated a static export with ten stories. Home/article routes and the nine legacy cover images worked; private feedback and a subsequent private revision did not enter the public copy.

The tests cover clean-main/origin matching, missed-queue and interrupted-job recovery, stale approvals during a build, deliberate build failure, damaged/missing photos, private-field rejection, managed legacy withdrawal, retained-release switching and local HTTP path isolation. The live symlink switch is exercised on disposable Linux fixtures by CI, not against the VM.

Visual review inspected real Chromium screenshots for the login screen, CMS dashboard and published mobile article. It caught a global heading-color rule that made the public CMS headline blend into the background. The scoped heading colors were fixed, large-headline contrast assertions were added and the actual snapshot build/browser workflow passed again. Both 1280×900 and 390×844 layouts were checked; no horizontal overflow was detected.

Reports/screenshots and generated credentials stay in ignored .local/browser directories. The last-run pointer identifies the latest local run; earlier full-suite and later targeted screenshots are separate runs. No outbox, account file, database, build log or upload is committed. Temporary test servers exit with Playwright.

## Environment limits and remaining work

The Windows sandbox denied loopback connections and Turbopack junction creation. Those checks were rerun successfully outside the sandbox using the normal local runtimes. Browser tests use the trusted Origin header on their direct API probes; normal browser requests retain Payload's origin/fetch-site checks. No Git credentials were extracted or Git configuration disabled.

The ordinary website still reports its existing React 18 deprecation and AVIF optimization warning. The branch does not claim a full dependency/security audit.

Production publication remains disabled. SSH/capacity/ownership inspection, approved live cutover, DNS/TLS, actual SMTP delivery, the first real administrators, 2FA, off-VM backup retention and a VM restore/publish drill remain. The current public website, main and the VM are not changed by these local checks.

Reproduce with the commands in ../README.md and website-publication.md. The cms-only GitHub workflow repeats migrations, the unit/REST/publication suites, both builds and Chromium on Linux; use its run associated with the pushed commit as the remote evidence.
