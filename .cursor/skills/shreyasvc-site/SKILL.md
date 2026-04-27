---
name: shreyasvc-site
description: >-
  Works on the iamshreyasvc.github.io Astro site—content collections, admin
  update helpers, tests, and GitHub Pages deploy rules. Use when editing this
  repository, adding or changing Markdown under src/content, running the site
  locally, fixing CI, or promoting changes from dev to main.
---

# shreyasvc-site (iamshreyasvc.github.io)

## Stack

- **Astro** 6, **TypeScript**, **Bootstrap** 5; **Node** `>=22.12.0` (CI uses Node 22).
- Entry config: `astro.config.mjs`. Content collections: `src/content.config.ts`.
- Routes and UI: `src/pages/`, `src/layouts/`, `src/components/`, `src/styles/global.css`; static files in `public/`.

## Commands

- `npm run dev` — local dev server.
- `npm run build` — production build to `dist/`.
- `npm run test` — `astro check` plus `vitest run` (keep green before pushing).

## Content collections

Markdown lives under `src/content/` with **required frontmatter** per collection:

| Collection | Path | Schema highlights |
|------------|------|---------------------|
| `updates` | `src/content/updates/*.md` | `date` (string), `order` (number) |
| `research` | `src/content/research/*.md` | `title`, `tags[]`, optional `featured` |
| `projects` | `src/content/projects/*.md` | `order`, optional `placeholder`, optional `title` |

After schema changes, update types usage in pages and any tests under `src/test/`.

## Code paths agents often touch

- **`src/lib/updateEntry.ts`** — helpers for parsing/updating entries (used by admin UI).
- **`src/scripts/admin-updates.ts`** — client script imported by **`src/pages/admin/index.astro`** (GitHub API–backed updates UI); not a standalone CLI.
- **Tests** — `src/lib/updateEntry.test.ts`, `src/test/*.test.ts`; config in `vitest.config.ts`.

Match existing formatting (tabs in TS/JS where the repo uses them).

## Branches and deploy

- **`main`** — merges here trigger **production** GitHub Pages deploy (`https://shreyasvc.com`). Reusable verify workflow runs first.
- **`dev`** — pushes run the same checks; no production Pages deploy from dev (see `.github/workflows/deploy.yml`).
- Default integration branch for features is typically **`dev`**; release by opening a PR **dev → main** when ready for production.

## CI

- Workflow: `.github/workflows/deploy.yml` (test job uses `.github/workflows/verify-reusable.yml`).
- Failing `npm run test` or build blocks deploy on `main`.
