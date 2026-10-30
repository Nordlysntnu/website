# The Nordlys website

Source code for [Nordlys NTNU's website](https://www.nordlysntnu.no/).

The site is built with Next.js and React, using the Next.js Pages Router. Production builds export static files. Content is currently maintained in Markdown, JavaScript and TypeScript files in this repository.

## Getting started

Install [Git](https://git-scm.com/downloads) and [Node.js](https://nodejs.org/en/download), which includes npm. The latest local validation used Node.js 24.15.0 and npm 11.12.1.

Clone the repository, install dependencies and start the development server:

```bash
git clone https://github.com/Nordlysntnu/website.git
cd website
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000), or the address printed in the terminal. Source changes normally appear automatically. Stop the server with Ctrl+C.

`npm ci` uses the versions recorded in `package-lock.json`. When intentionally adding or updating dependencies, use `npm install` and commit the updated package files together.

## Building and previewing

Build the production site:

```bash
npm run build
```

If Turbopack reports a filesystem error on Windows, use Webpack:

```bash
npm run build -- --webpack
```

The Webpack command passed the latest local production build and static export.

The project has `output: "export"` in [next.config.js](next.config.js), so the build generates an `out/` folder containing HTML, CSS, JavaScript and media files. See the [Next.js static export documentation](https://nextjs.org/docs/pages/guides/static-exports).

Preview those files with a static file server, for example [serve](https://github.com/vercel/serve):

```bash
npx serve@latest out
```

Open the address printed in the terminal. Check direct page URLs such as `/about` and `/blog`, as well as navigation from the homepage.

The existing `npm start` script runs `next start`, which is incompatible with this static export. The separate `npm run export` script is also obsolete; exporting happens during the build.

## Where to update content

All paths below are relative to the repository root.

| Content | Location |
| --- | --- |
| Homepage sections | [src/pages/index.js](src/pages/index.js) and [src/features/home/](src/features/home/) |
| Homepage opening text and image | [src/shared/components/Landing.js](src/shared/components/Landing.js) |
| Team profiles, photos and contact details | [src/features/team/data/members.json](src/features/team/data/members.json) |
| Project groups, roles and memberships | [src/features/team/data/projects/](src/features/team/data/projects/) |
| Team groups, project years and filtering | [src/features/team/TeamOverview.js](src/features/team/TeamOverview.js) |
| Team photos | [public/members/](public/members/) |
| About text | [src/markdown/about.md](src/markdown/about.md) |
| Competition history | [src/markdown/competitions.md](src/markdown/competitions.md) |
| Frequently asked questions | [src/markdown/faq.md](src/markdown/faq.md) |
| Recruitment groups and positions | [src/markdown/join.md](src/markdown/join.md) |
| Recruitment introduction and page layout | [src/pages/join.js](src/pages/join.js) |
| Footer contact information | [src/features/ui/Footer.js](src/features/ui/Footer.js) |
| Blog posts | [src/shared/data/blog.tsx](src/shared/data/blog.tsx) |
| Blog images | [public/blog/](public/blog/) |
| Sponsor lists, links and descriptions | [src/pages/partners.js](src/pages/partners.js) |
| Sponsor logos | [src/features/partners/sponsor-logos/](src/features/partners/sponsor-logos/) |

### Team and contact details

Each person must have a unique ID in `members.json`. When someone continues into another project year, reuse that ID in the project's membership file and keep previous years' memberships. Ordinary members use titles such as `Software Member`; confirmed group leaders appear first.

To add a project year, create its JSON file under `src/features/team/data/projects/` and register it in `projects.js`. The newest project and its group menu are selected automatically. See the [team data guide](src/features/team/data/README.md) for details, including temporary photo placeholders and phone visibility. Check the relevant groups and years in the browser after making changes.

Contact information appears in both the footer and individual member records. Check both when changing the main contact person.

### Blog posts and images

Add new posts at the beginning of the `blogs` array. The homepage uses `blogs[0]` as the latest update and links to the full post on the blog page.

Place images in `public/blog/` and reference them with URLs such as `/blog/compressed/example.webp`. Files in `public/` are served from the site root, so the URL does not include `public/`. Match filenames and capitalisation exactly, and check the images in the preview.

## Project structure

```text
website/
├── public/                  # Public images, videos and other static files
├── components/              # Additional components
├── docs/                    # Reports and supporting documentation
├── src/
│   ├── assets/              # Assets imported by components
│   ├── features/            # Components, styles and data grouped by feature
│   ├── markdown/            # Editable page content
│   ├── pages/               # Next.js pages and routes
│   └── shared/              # Shared components, styles, data and utilities
├── next.config.js           # Next.js and static export configuration
├── package.json             # Dependencies and npm scripts
├── package-lock.json        # Locked dependency versions
└── tsconfig.json            # TypeScript configuration and path aliases
```

The `.next/`, `out/` and `node_modules/` folders are generated locally and excluded from Git.

Path aliases are defined in [tsconfig.json](tsconfig.json):

| Alias | Location |
| --- | --- |
| `@features/*` | `src/features/*` |
| `@shared/*` | `src/shared/*` |
| `@assets/*` | `src/assets/*` |

For example:

```javascript
import Layout from '@shared/components/Layout';
```

## Contributing

Start from an updated `main` and create a branch for the change:

```bash
git status
git switch main
git pull --ff-only
git switch -c your-branch-name
```

Review any existing local changes before switching branches. Choose a branch name that describes the work, such as `update-team-2027` or `fix-team-filtering`.

Check the affected pages on desktop and mobile, including links and images. For team changes, also check switching between groups and project years. Run a production build using the commands above before opening a pull request.

Review, commit and push the intended files:

```bash
git status
git diff
git add path/to/changed-file
git commit -m "Describe the change"
git push -u origin HEAD
```

Open a pull request on GitHub with `main` as the base. Describe what changed and how you checked it, then review the diff before merging.

If your working branch needs changes from `main`, run these commands while on that branch:

```bash
git fetch origin
git merge origin/main
```

Resolve any conflicts, repeat the relevant checks and push the updated branch.

## Forms and deployment

The contact and recruitment forms send data to external Google Apps Script services. The browser code is in [ContactPane.js](src/features/ui/ContactPane.js) and [JoinForm.js](src/features/join/JoinForm.js); the Apps Script server code is not included here. A successful local build does not verify form delivery.

Production hosting must serve the contents of `out/` and resolve page URLs such as `/about` to their generated HTML files. The production destination, deployment method and rollback procedure still need to be documented. Keep credentials and server access details in Nordlys' internal documentation and link to the deployment instructions once confirmed.

After deploying, check the affected live pages, navigation, images and forms. Merging a pull request confirms the code change; deployment must be verified separately.
