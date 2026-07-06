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

## Deployment

The Cloudflare Pages project (`madsrudolph-dev`) and the custom domain `madsrudolph.dev` are
already set up. Deploys happen automatically via GitHub Actions.

### Automatic (CI, the normal path)

`.github/workflows/deploy.yml` builds the site and deploys it to Cloudflare Pages on every push to
`main` (and on manual dispatch from the Actions tab). It needs two repository secrets:

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | A scoped token — Cloudflare dashboard → **My Profile → API Tokens → Create Token**, template **"Edit Cloudflare Workers"** or a custom token with **Account → Cloudflare Pages → Edit**. |
| `CLOUDFLARE_ACCOUNT_ID` | The account ID (already added as a repo secret). |

Add the token once:

```bash
gh secret set CLOUDFLARE_API_TOKEN --repo MadsRudolph/madsrudolph.dev
# paste the token value when prompted
```

After that, `git push` is the whole deploy story.

### Manual (fallback)

```bash
npm run build
npx wrangler pages deploy dist --project-name madsrudolph-dev --branch main
```

### Custom domain

`madsrudolph.dev` is attached to the Pages project with a proxied apex `CNAME` →
`madsrudolph-dev.pages.dev`, TLS issued by Cloudflare. To add `www`: Pages project →
**Custom domains** → **Set up a custom domain** → `www`. `astro.config.mjs` sets
`site: 'https://madsrudolph.dev'` so canonical URLs and the sitemap are correct.

The site is fully static — no runtime secrets, no backend.

## Before you share the link

See **`MEDIA-SHOPPING-LIST.md`** for the photos/diagrams to add and the facts to confirm, and
**`SELECTION-NOTES.md`** for which projects were chosen and why, the open questions, and the
security actions required before certain repos are made public.

## License

Content (writeups, images) © Mads Rudolph. Site code is free to reuse.
