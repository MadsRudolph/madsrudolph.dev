# madsrudolph.dev

Personal engineering portfolio for Mads Rudolph — Elektroteknologi (B.Eng.) student at DTU.
A static site: hardware and firmware project writeups, each with a mandatory "what went wrong
and how it was diagnosed" section, because the debugging is the evidence.

Built with [Astro](https://astro.build). No backend, no database, no client framework — a little
progressive-enhancement JavaScript for the tag filter, and that's it. Fast by design; the
Lighthouse score is itself a signal to a technical reader.

## Stack

- **Astro 5** with content collections (Markdown writeups under `src/content/projects/`).
- **IBM Plex Mono / Sans** self-hosted via `@fontsource` (no external font requests).
- A single global stylesheet (`src/styles/global.css`) — an "engineering paper" theme.
- Static HTML output, deployed to **Cloudflare Pages**.

## Local development

Requires Node 18+ (developed on Node 22).

```bash
npm install
npm run dev      # dev server at http://localhost:4321
npm run build    # static build to ./dist
npm run preview  # serve the built ./dist locally
```

## Project structure

```
src/
  content/
    projects/           # one Markdown file per project writeup (the content)
  content.config.ts     # the projects collection schema (frontmatter contract)
  layouts/Base.astro    # shared page shell: header, footer, <head>
  components/ProjectCard.astro
  pages/
    index.astro         # front page: intro + 3 featured projects + contact
    about.astro
    cv.astro            # placeholder until real CV content lands
    404.astro
    projects/
      index.astro       # filterable project index
      [slug].astro      # renders each writeup
  styles/global.css
public/
  favicon.svg
  media/                # project photos/diagrams go here (see MEDIA-SHOPPING-LIST.md)
```

## Adding a new project

1. Create `src/content/projects/<slug>.md`. The URL will be `/projects/<slug>`.
2. Fill in the frontmatter (schema enforced by `src/content.config.ts`):

   ```yaml
   ---
   title: 'Human-readable title'
   summary: >-
     One or two sentences. This is the card blurb and the meta description.
   date: 2026-07-01          # date of last substantial work
   tags: ['KiCad', 'ESP32']  # drive the filterable index; keep names consistent
   repo: 'https://github.com/MadsRudolph/...'   # optional; omit for described-only pages
   featured: false           # true = eligible for the front-page featured list
   order: 20                 # sort key on the index; lower = higher up
   status: working           # working | in-progress | archived
   ---
   ```

3. Write the body following the house structure (see any existing writeup):
   **What it is → Problem/motivation → Architecture/approach → What went wrong and how it was
   diagnosed (mandatory) → Results → Tools & skills demonstrated.**
4. For images not yet shot, leave a placeholder:
   `<div class="media-placeholder">HERO: description</div>` and add a
   `<!-- PHOTO NEEDED: ... -->` comment. Track it in `MEDIA-SHOPPING-LIST.md`.
5. Never invent a number. Anything not traceable to the repo gets a `<!-- VERIFY: ... -->` comment.
6. `npm run build` to confirm it compiles, then commit.

Tags are free-form strings; reuse existing tag spellings so the filter groups them correctly.

## Deploying to Cloudflare Pages

The domain `madsrudolph.dev` is already on Cloudflare. One-time setup:

1. Push this repo to GitHub (e.g. `MadsRudolph/madsrudolph.dev`).
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**, and
   pick the repo.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** set env var `NODE_VERSION` = `22` (or 18+).
4. Save and deploy. Every push to the production branch redeploys automatically; pull requests get
   preview deployments.
5. **Custom domain:** Pages project → **Custom domains** → add `madsrudolph.dev` (and
   `www.madsrudolph.dev` if wanted). Since the domain is already on Cloudflare, the DNS records are
   created for you. `astro.config.mjs` already sets `site: 'https://madsrudolph.dev'` for correct
   canonical URLs.

No environment secrets are required — the site is fully static.

## Before you share the link

See **`MEDIA-SHOPPING-LIST.md`** for the photos/diagrams to add and the facts to confirm, and
**`SELECTION-NOTES.md`** for which projects were chosen and why, the open questions, and the
security actions required before certain repos are made public.

## License

Content (writeups, images) © Mads Rudolph. Site code is free to reuse.
