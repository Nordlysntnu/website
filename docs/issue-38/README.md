# Wider desktop homepage: issue #38

Developed on `fix/38-wide-desktop-layout`, starting from `main` at `99325ac`.
The wider homepage was reviewed in a side-by-side local preview and selected for merging. This report records the layout comparison and the checks for #38; it does not confirm a production deployment.

![Proposed desktop homepage](after-desktop-top.jpg)

## What changed

- The homepage uses up to 82rem of content width. The navigation, images and sections line up with the same edges.
- The opening section puts the existing headline next to a real photo of Lumholtz, with links to join and meet the team.
- The three goals use smaller icons beside the text instead of large icons above it.
- The project section shows the team and car at Rudskogen. This and the opening image already existed in the repository.
- The latest blog post is a short preview with one image. Both the image and "Read update" open the full post, where the existing five-photo gallery is still available.
- All seven groups fit on one row on desktop. The grid and the other sections adapt to smaller screens.
- The mobile menu is a labelled keyboard-operable button. The homepage also has a skip link and visible keyboard focus styles.

The homepage keeps the existing Rubik/Khand fonts and navy/pink colours. Most changes are in homepage components. The shared content and navigation styles use optional CSS variables, with their original values as fallbacks on other pages. The old landing styles used by the 404 page are separate from the new homepage styles.

## Before and after

Measured locally in the in-app browser. Page height includes the contact section and footer; this is a layout comparison, not a performance benchmark.

| Viewport | Before | After | Reduction in page height |
| --- | ---: | ---: | ---: |
| Desktop, 1440 x 900 | 3826px | 2820px | 26.3% |
| Mobile, 390 x 844 | 5917px | 4106px | 30.6% |

At the desktop comparison size, content width increases from 1000px to about 1310px. On a 1920px screen it stops at 1312px so text does not stretch across the whole screen.

Full screenshots: [desktop before](before-desktop.jpg), [desktop after](after-desktop.jpg), [mobile before](before-mobile.jpg), [mobile after](after-mobile.jpg).
The measured viewport sizes and dimensions are in [measurements.json](measurements.json).

## Checks

- Production build and static export passed using Next.js 16.4.1 and `next build --webpack` in an isolated local copy with the existing dependencies. No dependency or lockfile changes.
- Checked widths of 320, 390, 649, 650, 750, 751, 768, 899, 900, 1099, 1100, 1280, 1440 and 1920px, including both sides of the layout breakpoints. No horizontal page overflow was found. The homepage has one H1 at each size.
- Opened and closed the mobile menu, opened it with Enter, and verified that resizing to desktop closes it before returning to mobile.
- Reached the skip link with Tab and followed it to the homepage content.
- Followed "Read update" to `/blog#latest-post`; the post settles below the sticky navigation. Opened the gallery and stepped through all five photos, including wraparound, Previous and Close.
- Followed the About, Team and Join links. Their content/navigation widths keep the original 1000px limit; homepage CSS variables do not carry over.
- Followed all seven homepage group links and confirmed that each opens the matching team section.
- All nine exported HTML pages loaded from the local static preview. All 148 unique local assets referenced by those pages exist, and their internal page links resolve to exported files.
- Checked the application form's group/position choices and page controls. Empty application and contact submissions show validation errors; no application or message was sent to the live Google Apps Script services.
- The existing About video poster path and legacy Join board icon path pointed to missing files. Both references now use the existing repository images, and the production export was rebuilt and checked again.
- No warnings or errors were recorded in the homepage browser console during the initial checks. Broader stress checks found existing errors outside the new homepage, listed below.
- `git diff --check` passed. Existing local changes in `next-env.d.ts` and `tsconfig.json` were preserved and are outside this change.

### Existing findings and validation limits

- Rapid navigation can trigger a `clientHeight` null-reference error in `react-animation-on-scroll`, which is still used by other pages. The same error was reproduced with the earlier homepage on port 3007. The new homepage no longer uses that animation wrapper.
- Resizing after leaving the Join page can trigger a `scrollHeight` null-reference error from the existing recruitment group's resize listener (`src/features/team/Group.js`). That component is unchanged by #38. Its effect adds a listener without removing it on unmount.
- These existing animation/listener defects need a separate fix. No new layout or navigation failures were found in #38.
- GitHub has no build or test status checks configured for this branch; validation was performed locally. Live form delivery, the external Wiki/social sites, and production hosting/deployment were not verified.

## Review

The current local preview is at <http://127.0.0.1:3008/>. The earlier homepage is available at <http://127.0.0.1:3007/> while that preview server is running.

The wider direction was approved after comparing the earlier and updated homepages. The desktop homepage uses more of the screen, requires less scrolling, and keeps its responsive layout on smaller screens.

This branch starts from `main`. The paused #62 / Project 2027 team work remains in its own branch and preview. Team membership, recruitment information and contact details have not been updated as part of this layout proposal.
