# Portfolio site — status report

Status of the `madsrudolph.dev` portfolio site as of 2026-07-07, for handoff to the job-radar
subsystem. This is a complete snapshot; assume the reader has none of the building context.

The site is the **evidence base** the radar's scoring engine maps job requirements against. The
load-bearing inputs are: the list of project pages (§2/§3), the deep-link URL structure (§7), and
the exact tag vocabulary (§4).

> **Updated since the first report.** Material changes since the initial handoff: a 9th project
> (Componentbot) was added; the site was restyled to a dark "bench-instrument" theme with an
> animated hero and a glass profile card; a **bilingual EN/DA toggle** was added (this was
> explicitly out of scope in the original handoff — the user later requested it); AI competency is
> now positioned prominently; SRM-CAM is marked **flagship**; and the **GitHub Actions CI deploy is
> fully live** (both secrets set, deploys green). Details in §6.

---

## 1. Repo facts

- **Repo:** `github.com/MadsRudolph/madsrudolph.dev` — **public**.
- **Default branch:** `main`. **Local working copy:** `C:\Users\Mads2\projects\madsrudolph.dev`.
- **Hosting:** Cloudflare Pages, project **`madsrudolph-dev`**, account ID
  `a1746936cdb6f61f33f31a2a72e27500`.
- **Live:** **yes** — **https://madsrudolph.dev** (HTTP 200, TLS by Google Trust Services via
  Cloudflare) and `https://madsrudolph-dev.pages.dev`. Custom domain attached via a proxied apex
  `CNAME` → `madsrudolph-dev.pages.dev`. Zone is on Cloudflare (registrar name.com, nameservers
  delegated).
- **Deploys:** **fully automatic.** GitHub Actions (`.github/workflows/deploy.yml`) builds and
  deploys on every push to `main`. Both required repo secrets — `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID` — are set; latest run is green. No setup steps remain. Edge propagation to
  the custom domain lags a deploy by ~1 minute (normal).
- **Languages:** English (default, at `/`) + Danish (at `/da/…`) via a header toggle. See §7.
- **Commit hygiene:** no AI/co-author attribution in any commit (user requirement); contributor
  graph shows only `MadsRudolph`.

---

## 2. Project selection

**Nine** project writeups (was eight; Componentbot added to anchor the AI-competency positioning).
Chosen for distinct skill coverage and strong "what went wrong / how I diagnosed it" narratives.

| Slug | One-line description | Flag |
|------|----------------------|------|
| `srm-cam` | KiCad-Gerber → machine-code CAM tool for a Roland SRM-20 PCB mill; reverse-engineered SPI probe, auto bed-leveling, double-sided registration. | ★ featured · **flagship** |
| `esp32-reflow-hotplate` | From-scratch 24 V DC SMD reflow hotplate: ESP32, CNC-milled control board, unit-tested PID core, safety watchdog, IPC-2221 copper sizing. | ★ featured |
| `korad-uart-reverse-engineering` | Reverse-engineered a Korad KD3005D PSU's hidden UART with a logic analyzer; caught a floating-ground hazard with a multimeter; isolation-safe ESP32 carrier PCB. | ★ featured |
| `dtu-multimeter` | 22-mode digital multimeter on bare-metal AVR (ATmega2560), full analog front-end, MCP3208 ADC, written calibration procedure. | |
| `ir-blaster` | ESP32 IR blaster as an ESPHome component + a Home Assistant add-on that discovers IR codes from Flipper-IRDB; protocol-encoding debugging. | |
| `regbot-studio` | Full-stack (FastAPI + React/TS) web GUI for the DTU REGBOT balance robot with live Bode/step/Nyquist simulation; layered backend enforced in CI. | |
| `cadence-opamp` | Analog IC design (180 nm CMOS, Cadence) with a Git-synced two-user workflow. **Described-only — no repo link** (NDA PDK). | |
| `pi-zero-pwm-filter` | Early project: Pi Zero Spotify streamer with a Sallen-Key PWM-to-audio filter, characterized with measurements. | |
| `componentbot` | Grounded local-LLM (Ollama/Llama 3.2) CLI that answers "is this part in stock?" from the real DTU shop inventory. Demonstrates practical LLM engineering. | |

**"Best at" positioning:** the user's stated ideal role is **hardware troubleshooting / debugging**
— surfaced prominently on the About page ("The work I want" section) and in the profile card. The
radar should weight postings that mention debugging, fault diagnosis, bring-up, test, or
troubleshooting especially highly for this candidate.

### Close calls / excluded (candidate evidence pages not yet built)

- **`rfid-card-reader`** (in `personal-projects`) — MFRC522 + MIFARE Classic cryptanalysis on
  bare-metal ATmega328P + Python GUI. Strong, embedded-heavy. **Held in reserve** (would be a 10th
  page). Good match if a posting emphasizes security/RFID/embedded-security. Open question to Mads.
- **Home-lab supporting cast** — `xiaomi-s400` BLE scale, `esp32-soil-moisture`,
  `component-inventory`, `ad3-logic-analyzer` (cited within the Korad page). Candidates for a future
  combined "home lab" page.
- **`SPICEPilot`** — LLM-for-SPICE research; currently only *mentioned* on the About page, not a
  writeup. Possible next AI page.
- **`DTU-PCB-prototyping`** — the fiber-laser/CNC PCB-fab guide; linked from `/about`, not a writeup.
- **Software dashboards** (`budget-dashboard`, `health-dashboard`, `spotify-addon`,
  `ha-addon-budget-dashboard`) — off-audience + secret-history issues; excluded, not linked.
- **Excluded outright** — coursework/report repos, `mosen`, `Componentbot`'s sibling utilities, etc.

Full rationale in `SELECTION-NOTES.md`.

---

## 3. Per-project page inventory

All nine pages have **complete written content** (house template: What it is → Problem/motivation →
Architecture → What went wrong and how it was diagnosed → Results → Tools & skills). None are
drafts. All are **English-only** and live. Each is blocked only on **media** (photos/diagrams are
placeholders) and, where noted, a `VERIFY` confirmation.

URL path pattern: `/projects/<slug>` (see §7). Index sort is by frontmatter `order`.

| Slug | URL path | Tags (exact) | Blocking (media / verify) |
|------|----------|--------------|---------------------------|
| `srm-cam` | `/projects/srm-cam` | Python, PySide6, CNC / grbl, Arduino, SPI, Reverse engineering, Computational geometry, KiCad | Hero photo, finished-board photo, pipeline diagram; VERIFY: scrub local Windows paths from repo docs |
| `esp32-reflow-hotplate` | `/projects/esp32-reflow-hotplate` | Embedded C, ESP32 / ESP-IDF, KiCad, PID control, Power electronics, Safety-critical, Firmware testing, 3D CAD | Hero photo, block diagram; VERIFY build status (`in-progress`) |
| `korad-uart-reverse-engineering` | `/projects/korad-uart-reverse-engineering` | Reverse engineering, UART, Logic analyzer, Python, KiCad, PCB design, Power electronics, Safety | Hero + board photo, decoded-UART capture, diagram; VERIFY carrier bench-tested? |
| `dtu-multimeter` | `/projects/dtu-multimeter` | ATmega2560, Bare-metal AVR, Embedded C, KiCad, Analog front-end, SPI, I2C, Measurement | Hero photo, front-end diagram; VERIFY firmware phase (`in-progress`) |
| `ir-blaster` | `/projects/ir-blaster` | Embedded C++, ESPHome component, ESP32, Python / FastAPI, IR protocols, State machine, SPIFFS, Home Assistant | Hero photo, architecture diagram. Links only the public `ir-remote-wizard`; `ir-blaster-standalone` private w/ secrets (see §5) |
| `regbot-studio` | `/projects/regbot-studio` | Python / FastAPI, React / TypeScript, Control theory, WebSocket, Async serial, Full-stack, python-control | Hero screenshot/GIF |
| `cadence-opamp` | `/projects/cadence-opamp` | Cadence Virtuoso, Analog IC design, SKILL, Spectre, Python, Git workflow, 180 nm CMOS | Confidentiality-checked figure; **no repo link by design** (NDA); open question: OK to publish under DTU policy? |
| `pi-zero-pwm-filter` | `/projects/pi-zero-pwm-filter` | Analog electronics, Filter design, PWM DAC, Op-amp (TL072), Raspberry Pi, Measurement | Hero photo + plots; VERIFY 2 measured numbers |
| `componentbot` | `/projects/componentbot` | Python, LLM, Ollama, Prompt engineering, RAG / grounding, CLI tool | Terminal-session hero screenshot, optional grounding-pipeline diagram |

**Featured (front page):** `srm-cam` (also **flagship**, shows a `★ flagship` badge), `esp32-reflow-hotplate`,
`korad-uart-reverse-engineering`. **`status` values:** `working` (srm-cam, korad, ir-blaster,
regbot-studio, pi-zero, componentbot), `in-progress` (esp32-reflow-hotplate, dtu-multimeter),
`archived` (cadence-opamp).

---

## 4. Tag vocabulary (exact strings — radar must match verbatim)

The `/projects` filter matches by **exact string** (case/punctuation-sensitive). 55 distinct tags in
use (5 new since the first report: `CLI tool`, `LLM`, `Ollama`, `Prompt engineering`,
`RAG / grounding`):

```
180 nm CMOS
3D CAD
ATmega2560
Analog IC design
Analog electronics
Analog front-end
Arduino
Async serial
Bare-metal AVR
CLI tool
CNC / grbl
Cadence Virtuoso
Computational geometry
Control theory
ESP32
ESP32 / ESP-IDF
ESPHome component
Embedded C
Embedded C++
Filter design
Firmware testing
Full-stack
Git workflow
Home Assistant
I2C
IR protocols
KiCad
LLM
Logic analyzer
Measurement
Ollama
Op-amp (TL072)
PCB design
PID control
PWM DAC
Power electronics
Prompt engineering
PySide6
Python
Python / FastAPI
RAG / grounding
Raspberry Pi
React / TypeScript
Reverse engineering
SKILL
SPI
SPIFFS
Safety
Safety-critical
Spectre
State machine
UART
WebSocket
python-control
```

**Radar caveats:**
- Tags are free-form, not a controlled taxonomy. Treat near-duplicates as synonyms: `ESP32` /
  `ESP32 / ESP-IDF`; `Embedded C` / `Embedded C++`; `Python` / `Python / FastAPI` / `python-control`;
  `Safety` / `Safety-critical`; `Analog electronics` / `Analog IC design` / `Analog front-end`;
  `LLM` / `Prompt engineering` / `RAG / grounding`.
- Some evidenced skills are **not** tags (Freerouting, FlatCAM, MAX31855, IPC-2221, MQTT, Docker,
  Git/CI, **hardware debugging/troubleshooting**). The debugging strength in particular lives in the
  writeups' "what went wrong" sections and the About page, not the tag set — weight it from there.
- Vocabulary changes are cheap (edit frontmatter); request normalization if exact-match is brittle.

---

## 5. Outstanding items

### Media (full list in `MEDIA-SHOPPING-LIST.md`)
- **Done:** portrait photo added to the About page (framed in the glass profile card).
- **Photos to shoot:** one hero per project (SRM-CAM GUI+mill, reflow hotplate, Korad+AD3, carrier
  board, multimeter prototype, IR blaster, RegBot screenshot, Cadence figure, Pi-Zero filter+plots,
  Componentbot terminal session).
- **Diagrams (offered as inline SVG, not yet drawn):** SRM-CAM pipeline, reflow power/control, Korad
  signal chain, multimeter front-end, IR-blaster architecture, Componentbot grounding pipeline.

### Unresolved `<!-- VERIFY -->` flags
- `pi-zero-pwm-filter` — confirm the **−40.6 dB @ 31.25 kHz** attenuation and **~75% / −22.6 dB**
  ALSA figures from saved captures.
- `esp32-reflow-hotplate` / `dtu-multimeter` — confirm build/firmware status; update `status`.
- `korad-uart-reverse-engineering` — is the carrier board bench-tested end-to-end?
- `srm-cam` — scrub local Windows paths from the repo's docs.
- `cadence-opamp` — confirm publishability under DTU/course policy.
- **Portrait** — the source JPG has a small "AI-generated content" watermark; it's CSS-cropped out
  (object-position top), but Mads may want to swap in a clean image.
- Contact block — phone/street address intentionally omitted; email is `mads28122001@hotmail.dk`.

### Open questions for Mads
- **LinkedIn** — still not added; awaiting a URL. (Email decided: hotmail.dk to match his CVs.)
- **Cadence publishability** — still open (page is live, described-only, no repo).
- **RFID cryptanalysis as a 10th writeup** — still open.
- **DDR3 SPD reader** — does not exist in any repo (handoff inventory was stale); dropped.
- **AD3 overvoltage/golden-board repair story** — not documented in any repo; not written.

### Security actions (before those repos go public)
- **`ir-blaster-standalone`** (private) — committed WiFi/OTA secrets in history; rotate + scrub
  before making public. Site links only the clean `ir-remote-wizard`.
- **`ha-addon-budget-dashboard`** (public) — Enable Banking key/session leaked in history; rotate.
  Not linked.

---

## 6. Deviations from PORTFOLIO-HANDOFF.md

1. **Bilingual EN/DA** — the handoff said full i18n was **out of scope for v1** ("do not build a
   translation system"). The user later explicitly requested it, so a light EN/DA toggle was added
   for the **chrome + home/About/CV/projects-index**; **project writeups stay English** (noted on the
   Danish pages). Default language English. This overrides the handoff per the user's instruction.
2. **Dark theme + visual elevation** — the handoff didn't specify visual style. Site is a dark
   "bench-instrument" theme: animated oscilloscope hero (a damped step response), a two-channel
   orange/teal palette, engineering-drawing corner marks, indexed project cards with status LEDs,
   and staggered load motion (all `prefers-reduced-motion`-safe).
3. **Glass profile card** — the About page has a frosted-glass (iOS-style, `backdrop-filter`) profile
   card with the portrait and personal info, at the user's request.
4. **AI competency positioned prominently** — "Working with AI" section (framed as orchestration +
   test-driven verification, per how the user actually works), a CV skills group, a front-page spec
   chip, and the Componentbot writeup. Consistent with the no-AI-attribution commit rule (markets the
   *skill*; the work reads as the user's).
5. **"The work I want" / debugging focus** — an About section and the profile card's "Best at" line
   put hardware troubleshooting front and center as the sought role.
6. **SRM-CAM flagged as flagship** — badge on its card + a personal note in the writeup, at the
   user's request ("my proudest, most complete project").
7. **9th writeup (Componentbot)** — beyond the "5–8" in the handoff; added to anchor AI positioning.
8. **Contact email** — publishes `mads28122001@hotmail.dk` (matches the user's CVs), not the gmail on
   his accounts. Phone/street address kept off public pages.
9. **CV page** — handoff said placeholder; now has **real content** (the user supplied his CVs).
10. **Deploy mechanism** — "deployed from the GitHub repo on push" implemented via **GitHub Actions**
    running `wrangler pages deploy` (not Cloudflare's native Git integration), to preserve the
    already-live project + custom domain.
11. **Inventory mismatches** (handoff "repo wins") — the DDR3 SPD reader and AD3 repair story from the
    handoff don't exist in the repos; neither was written.

Everything else follows the handoff: Astro + content collections, Cloudflare Pages, no
backend/framework bloat, `/projects/<slug>` URLs, filterable index, front page, About, house template,
`SELECTION-NOTES.md` + `MEDIA-SHOPPING-LIST.md` + README, professional commit history.

---

## 7. Technical notes for a sibling project (the radar)

### Deep-link URL structure (for the cover-letter generator)
- **Canonical form:** `https://madsrudolph.dev/projects/<slug>` — **no trailing slash, no `.html`**
  (`trailingSlash: 'never'`, build `format: 'file'`; Cloudflare serves the clean URL, and
  `.html`/trailing-slash variants redirect/resolve). Link the canonical form.
- **Slugs (stable):** `srm-cam`, `esp32-reflow-hotplate`, `korad-uart-reverse-engineering`,
  `dtu-multimeter`, `ir-blaster`, `regbot-studio`, `cadence-opamp`, `pi-zero-pwm-filter`,
  `componentbot`.
- **Other routes:** `/` (home), `/projects` (filterable index), `/about`, `/cv`, `/404`.
- **Danish routes:** `/da` (home), `/da/about`, `/da/cv`, `/da/projects`. There are **no Danish
  writeup pages** — Danish project cards link to the English `/projects/<slug>`. (Note: with build
  `format: 'file'`, `/da` is served by `da.html` and `/da/projects` by `da/projects.html`.)
- `hreflang` alternates (`en`/`da`/`x-default`) are emitted per page; `site` is
  `https://madsrudolph.dev`, so canonical/sitemap URLs are absolute. Sitemap at `/sitemap-index.xml`.

### How deploys trigger
- Push to `main` → GitHub Actions → `npm ci` → `npm run build` → `cloudflare/wrangler-action@v3`
  running `wrangler pages deploy dist --project-name=madsrudolph-dev --branch=main`. Also
  `workflow_dispatch`. Secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` are set. Manual
  fallback: `npm run build && npx wrangler pages deploy dist --project-name madsrudolph-dev --branch main`.
- **For the radar:** the site is public HTTP — no credentials needed to *read* it. To *add/edit*
  pages, commit markdown to this repo and push (live in ~1 min); do **not** push direct uploads.

### Build tooling / stack
- **Astro `^5.12.0`** (static). **Node 22**, **npm** (`npm ci` in CI). `@astrojs/sitemap `^3.7.3``.
  Self-hosted fonts `@fontsource/ibm-plex-mono` + `-sans `^5.2.5``. Code blocks: Shiki `github-dark`.
- No client framework, no backend. Minimal JS: the `/projects` tag filter is ~20 lines of vanilla
  progressive-enhancement JS (works without it). The About glass card uses CSS `backdrop-filter`.
- Known cosmetic CI notice: actions emit a "Node 20 deprecation" warning (non-blocking).

### Content model (adding/editing evidence pages programmatically)
- Collection in `src/content.config.ts`; one markdown file per project at
  `src/content/projects/<slug>.md` (filename = slug = URL).
- **Frontmatter schema (build-enforced):** `title`, `summary`, `date`, `tags` (string[] — the radar's
  match surface), `repo?` (omit for described-only pages like Cadence), `featured` (bool),
  `flagship` (bool — badge), `order` (number, index sort), `status` (`working` | `in-progress` |
  `archived`), optional `hero` / `heroAlt`. `npm run build` validates and fails on schema violations.
- **i18n:** `src/i18n.ts` holds the chrome string table; `Base.astro` takes `lang` (`'en'|'da'`) and
  `altUrl` (counterpart URL) props and renders the nav/footer/toggle/hreflang. Danish narrative pages
  live under `src/pages/da/`. Writeups are single-language (English) by design.
