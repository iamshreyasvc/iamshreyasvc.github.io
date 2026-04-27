# shreyasvc-site

Personal site for **Shreyas V Chandramouli**, built as a static site and deployed to GitHub Pages.

## Stack

- [Astro](https://astro.build/) — static site generator and routing
- [Bootstrap 5](https://getbootstrap.com/) — layout and components
- Content in Markdown under `src/content/` (updates, research, projects)

Production URL: [https://shreyasvc.com](https://shreyasvc.com) (and the default `*.github.io` host for this repo when Pages is configured).

## Prerequisites

- **Node.js** 22.12+ (see `package.json` `engines`)

## Commands

```bash
npm ci          # install dependencies
npm run dev     # local dev server (default http://localhost:4321)
npm run build   # production build → dist/
npm run preview # serve dist/ locally
```

## Project layout

| Path | Purpose |
|------|---------|
| `src/pages/` | Routes (`/`, `/about`, `/research`, …) |
| `src/layouts/` | Shared page shell |
| `src/components/` | Navbar, footer, social links |
| `src/styles/global.css` | Theme and overrides |
| `src/content.config.ts` | Content collection schemas |
| `src/content/` | Markdown for updates, research, projects |
| `public/` | Static assets and legacy `*.html` redirects |

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) runs `npm ci` and `npm run build`, then publishes the **`dist/`** folder to GitHub Pages on pushes to **`main`**. Ensure **Settings → Pages → Build and deployment** uses **GitHub Actions**, not “Deploy from a branch” at the repo root.

## License

All rights reserved unless otherwise noted.
