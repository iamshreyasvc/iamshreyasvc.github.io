---
name: dev-main-pr-workflow
description: >-
  Opens and lands pull requests from dev into main for iamshreyasvc.github.io,
  using GitHub CLI and the repo CI expectations. Use when promoting dev to
  production, creating or updating a dev→main PR, or explaining what gates
  must pass before GitHub Pages deploys.
---

# Dev → main PR workflow

## When to use this path

- Production site (**https://shreyasvc.com**) deploys from **`main`** only (see `.github/workflows/deploy.yml`).
- **`dev`** runs the same checks on push/PR but does **not** trigger production Pages deploy.
- Integrate feature work on **`dev`** (or merge into `dev` first), then ship to users via **PR: base `main`, head `dev`**.

## Pre-push tests (run before pushing to `dev`)

Run these **in order** from the repo root; all must pass. They mirror what CI runs before deploy (`verify-reusable.yml`).

1. **`npm ci`** — clean install (same lockfile CI uses).
2. **`npm run test`** — `astro check` plus `vitest run`.
3. **`npm run build`** — production build to `dist/`.

Optional smoke (not required by CI): `npm run preview` and spot-check key routes locally.

Do **not** push to `dev` until steps 1–3 succeed (unless fixing CI-only issues in a follow-up commit immediately after).

## PR description requirements (dev → main)

Every dev→main PR body must include these sections, in order, using complete sentences and concrete bullets (no empty headings).

1. **Summary** — One short paragraph: what this release does and why it is being promoted now.
2. **User-visible changes** — Bulleted list of what visitors will see or experience (pages, content, styling, copy). If none, state “No user-visible changes (tooling/CI only).”
3. **Verification** — Bulleted list of what was run locally (at minimum: `npm ci`, `npm run test`, `npm run build`) and any manual checks (e.g. `/admin`, dark mode).
4. **Risks / follow-ups** — Optional; call out anything risky, rollback notes, or deferred work.
5. **Tests** - UI tests that need to be conducted before merging this PR to Production. 


### PR body template (copy for `gh pr create --body-file` or paste into GitHub)

```markdown
## Summary



## User-visible changes

-

## Verification

- `npm ci`
- `npm run test`
- `npm run build`

## Risks / follow-ups

-
```

## Before opening the PR

1. **`dev` is current on the remote**  
   `git fetch origin dev main` and confirm the commits you expect are on `origin/dev`.

2. **Pre-push tests** (above) have passed on the commit you are about to merge.

3. **Avoid duplicate PRs**  
   `gh pr list --base main --head dev --state open`

## Create the PR (GitHub CLI)

Logged in: `gh auth status`.

```bash
git fetch origin dev main
gh pr create --base main --head dev --title "Merge dev into main" --body-file -
# paste the filled template, then Ctrl-D
```

Or use `--body "$(cat <<'EOF'
…filled markdown…
EOF
)"` on Unix. The PR body must satisfy **PR description requirements** above.

## CI expectations

The **`test`** job (reusable **`.github/workflows/verify-reusable.yml`**) runs on every push and PR:

- `npm ci`
- `npm test` → `astro check` and `vitest`
- `npm run build`
- Verifies key `dist/` outputs exist (index, about, admin, research, projects, resume) and a simple content grep on `dist/index.html`

PRs **cannot merge safely** for production if this fails; fix on `dev`, push, and the PR updates automatically.

## After merge

- **`main`** push runs checks again, then **deploys** `dist/` to GitHub Pages (production environment in the workflow).
- **`dev`** stays the integration branch; continue feature work there for the next cycle.

## Quick checklist

- [ ] **Pre-push tests** (`npm ci`, `npm run test`, `npm run build`) passed before the last push to `dev`
- [ ] Changes intended for production are on **`origin/dev`**
- [ ] No open conflicting dev→main PR (or you are updating the right one)
- [ ] PR targets **`main`** ← **`dev`**
- [ ] PR body includes **Summary**, **User-visible changes**, **Verification**, and **Risks / follow-ups** (as required)
- [ ] CI green on the PR
- [ ] Merge when ready (squash vs merge commit: follow repo preference)
