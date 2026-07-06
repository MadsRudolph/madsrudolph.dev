# Portfolio site — status report

Status of the `madsrudolph.dev` portfolio site as of 2026-07-07, for handoff to the job-radar
subsystem. This is a complete snapshot; assume the reader has none of the building context.

The site is the **evidence base** the radar's scoring engine maps job requirements against. The
authoritative inputs the radar cares about are: the list of project pages (section 2/3), the
deep-link URL structure (section 7), and the exact tag vocabulary (section 4).

---

## 1. Repo facts

- **Repo:** `github.com/MadsRudolph/madsrudolph.dev` — **public**.
- **Default branch:** `main`.
- **Local working copy:** `C:\Users\Mads2\projects\madsrudolph.dev`.
- **Hosting:** Cloudflare Pages, project name **`madsrudolph-dev`**, account ID
  `a1746936cdb6f61f33f31a2a72e27500`.
- **Live:** **yes.**
  - Primary: **https://madsrudolph.dev** (returns HTTP 200; TLS by Google Trust Services via
    Cloudflare).
  - Also: `https://madsrudolph-dev.pages.dev`.
  - Custom domain is attached via a proxied apex `CNAME` → `madsrudolph-dev.pages.dev`. The
    `madsrudolph.dev` zone is on Cloudflare (registrar is name.com, nameservers delegated to
    Cloudflare).
- **Deploys:** automatic via GitHub Actions on push to `main` (see section 7). Last run: green
  (build + deploy succeeded). No setup steps remain — the pipeline is complete and both required
  secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) are set.

---

## 2. Project selection

**Eight** project writeups were selected (handoff asked for ~5–8; depth over breadth). Chosen for
distinct skill coverage and strong "what went wrong / how I diagnosed it" debugging narratives.

| Slug | One-line description | Featured |
|------|----------------------|----------|
| `srm-cam` | Desktop CAM tool converting KiCad Gerbers to machine code for a Roland SRM-20 PCB mill; reverse-engineered SPI probe, auto bed-leveling, double-sided registration. | ★ |
| `esp32-reflow-hotplate` | From-scratch 24 V DC SMD reflow hotplate: ESP32, CNC-milled control board, unit-tested PID core, layered safety watchdog, IPC-2221 copper sizing. | ★ |
| `korad-uart-reverse-engineering` | Reverse-engineered a Korad KD3005D bench PSU's hidden UART with a logic analyzer; caught a floating-ground hazard with a multimeter; isolation-safe ESP32 carrier PCB. | ★ |
| `dtu-multimeter` | 22-mode digital multimeter on bare-metal AVR (ATmega2560), full analog front-end, MCP3208 ADC, written calibration procedure. | |
| `ir-blaster` | ESP32 IR blaster as a proper ESPHome component + a Home Assistant add-on that discovers IR codes from Flipper-IRDB; protocol-encoding debugging. | |
| `regbot-studio` | Full-stack (FastAPI + React/TS) web GUI for the DTU REGBOT balance robot with live Bode/step/Nyquist simulation; layered backend enforced in CI. | |
| `cadence-opamp` | Analog IC design (180 nm CMOS, Cadence) with a Git-synchronized two-user workflow. **Described-only — no repo link** (NDA PDK). | |
| `pi-zero-pwm-filter` | Early project: Pi Zero Spotify streamer with a Sallen-Key PWM-to-audio filter, characterized with measurements. | |

### Close calls / excluded (matters to the radar — these are potential evidence pages not yet built)

- **`rfid-card-reader`** (in the `personal-projects` monorepo) — MFRC522 + MIFARE Classic
  cryptanalysis (nested/darkside/mfkey32) on bare-metal ATmega328P with a Python GUI. Genuinely
  strong and embedded-heavy. **Held in reserve**, not written, for two reasons: eight was already a
  full set, and the security/dual-use framing needs a careful defensive tone. **Open question to
  Mads: add as a 9th writeup?** If a job posting emphasizes security/RFID/embedded-security, this is
  the missing evidence page.
- **Home-lab supporting cast** — `xiaomi-s400` BLE body scale, `esp32-soil-moisture` notifier,
  `component-inventory` tool, `ad3-logic-analyzer` harness (the last is *cited within* the Korad
  page rather than given its own). All real, all in `personal-projects`. Candidates for a future
  combined "home lab" page.
- **`DTU-PCB-prototyping`** — the fiber-laser + CNC PCB-fab guide. Excellent technical writing but
  it's documentation, not an engineering project. **Linked from `/about`**, not given a writeup.
- **Software dashboards** — `budget-dashboard`, `health-dashboard`, `spotify-addon`,
  `ha-addon-budget-dashboard`. Substantial but pure app work (off-audience for electronics
  employers), and two have secret-exposure history. Excluded from writeups; not linked.
- **Excluded outright** — coursework/report repos (`DTU`, `PWA/PWB/PWF`, `Measurement-report`,
  `lcd1-*`, etc.), `mosen` (business app), `Componentbot` (thin utility), research-adjacent repos.

Full rationale is in `SELECTION-NOTES.md`.

---

## 3. Per-project page inventory

All eight pages have **complete written content** following the house template (What it is →
Problem/motivation → Architecture/approach → What went wrong and how it was diagnosed → Results →
Tools & skills demonstrated). None are drafts. Every page is **blocked only on media** (photos +
diagrams are placeholders) and, where noted, on a `VERIFY` confirmation. All are published/live
except where the "publish state" column notes otherwise.

URL path pattern: `/projects/<slug>` (see section 7).

| Slug | URL path | Tags (exact) | Content state | Media/verify blocking | Publish state |
|------|----------|--------------|---------------|-----------------------|---------------|
| `srm-cam` | `/projects/srm-cam` | Python, PySide6, CNC / grbl, Arduino, SPI, Reverse engineering, Computational geometry, KiCad | Done | Hero photo, finished-board photo, 1 pipeline diagram; 1 VERIFY (scrub local Windows paths from repo docs) | Live |
| `esp32-reflow-hotplate` | `/projects/esp32-reflow-hotplate` | Embedded C, ESP32 / ESP-IDF, KiCad, PID control, Power electronics, Safety-critical, Firmware testing, 3D CAD | Done | Hero photo, 1 block diagram; VERIFY build status (still pre-fab → `status: in-progress`) | Live |
| `korad-uart-reverse-engineering` | `/projects/korad-uart-reverse-engineering` | Reverse engineering, UART, Logic analyzer, Python, KiCad, PCB design, Power electronics, Safety | Done | Hero photo, board photo, decoded-UART capture, 1 diagram; VERIFY whether carrier board is bench-tested end-to-end | Live |
| `dtu-multimeter` | `/projects/dtu-multimeter` | ATmega2560, Bare-metal AVR, Embedded C, KiCad, Analog front-end, SPI, I2C, Measurement | Done | Hero photo, 1 front-end diagram; VERIFY firmware phase count / what's working on HW (`status: in-progress`) | Live |
| `ir-blaster` | `/projects/ir-blaster` | Embedded C++, ESPHome component, ESP32, Python / FastAPI, IR protocols, State machine, SPIFFS, Home Assistant | Done | Hero photo, 1 architecture diagram | Live. Links only the public clean `ir-remote-wizard` repo; the `ir-blaster-standalone` repo is private with secrets in history (see §5) |
| `regbot-studio` | `/projects/regbot-studio` | Python / FastAPI, React / TypeScript, Control theory, WebSocket, Async serial, Full-stack, python-control | Done | Hero screenshot/GIF only (no VERIFY) | Live |
| `cadence-opamp` | `/projects/cadence-opamp` | Cadence Virtuoso, Analog IC design, SKILL, Spectre, Python, Git workflow, 180 nm CMOS | Done | 1 confidentiality-checked figure; **open question: is publishing this OK under DTU/course policy?** | Live but flagged — **no repo link by design** (NDA PDK); may need to be unlisted/cut pending Mads's answer |
| `pi-zero-pwm-filter` | `/projects/pi-zero-pwm-filter` | Analog electronics, Filter design, PWM DAC, Op-amp (TL072), Raspberry Pi, Measurement | Done | Hero photo + measurement plots; 2 VERIFY (the −40.6 dB @ 31.25 kHz attenuation and ~75% / −22.6 dB ALSA figures) | Live |

**Featured (front page + eligible for featured list):** `srm-cam`, `esp32-reflow-hotplate`,
`korad-uart-reverse-engineering`. Ordering on `/projects` is by the frontmatter `order` field
(srm-cam 1 → pi-zero-pwm-filter 8).

`status` values in use: `working` (srm-cam, korad, ir-blaster, regbot-studio, pi-zero),
`in-progress` (esp32-reflow-hotplate, dtu-multimeter), `archived` (cadence-opamp).

---

## 4. Tag vocabulary (exact strings — the radar must match against these verbatim)

The tag filter on `/projects` matches by **exact string** (case- and punctuation-sensitive). The 49
distinct tags currently in use, exactly as written:

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
Logic analyzer
Measurement
Op-amp (TL072)
PCB design
PID control
PWM DAC
Power electronics
PySide6
Python
Python / FastAPI
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

**Radar caveats about this vocabulary:**
- The tags are free-form strings, not a controlled taxonomy. There are near-duplicates that a
  requirement-matcher should treat as synonyms: `ESP32` vs `ESP32 / ESP-IDF`; `Embedded C` vs
  `Embedded C++`; `Python` vs `Python / FastAPI` vs `python-control`; `Safety` vs `Safety-critical`;
  `Analog electronics` vs `Analog IC design` vs `Analog front-end`.
- Some real skills evidenced in the writeups are **not** surfaced as tags (e.g. Freerouting,
  FlatCAM, MAX31855, IPC-2221, MQTT, Docker, Git/CI). If the radar needs those, they live in the
  page body, not the tag set.
- Adding/renaming tags is cheap (edit frontmatter), so the radar team can request vocabulary
  normalization if exact-match proves brittle.

---

## 5. Outstanding items

### MEDIA-SHOPPING-LIST.md (summary — full file at repo root)
- **Photos to shoot** (one hero per project + a few extras): srm-cam GUI-with-mill hero + finished
  board; reflow hotplate hero; Korad-open-with-AD3 hero + carrier board + decoded-UART capture; DTU
  multimeter prototype; IR blaster hardware + web UI; RegBot Studio screenshot/GIF; Cadence
  schematic/plot (confidentiality-checked); Pi Zero filter build + measurement plots.
- **Diagrams to make** (5 block diagrams offered as inline SVG, not yet drawn): srm-cam pipeline,
  reflow power/control, Korad signal chain, multimeter front-end, IR-blaster architecture.
- **How media slots in:** placeholders are `<div class="media-placeholder">…</div>` blocks in the
  markdown; replace with a normal image reference to `public/media/<slug>/…`.

### Unresolved `<!-- VERIFY -->` flags (in the writeups)
- `pi-zero-pwm-filter` — confirm the **−40.6 dB @ 31.25 kHz** PWM attenuation and the **~75% /
  −22.6 dB** ALSA operating-point figures from saved captures. (These are the only quantitative
  claims on the site pulled from repo notes that need bench confirmation.)
- `esp32-reflow-hotplate` — confirm build status (board fabricated/populated yet?) and update
  `status`.
- `dtu-multimeter` — confirm firmware phase count (~12/16) and what's working on hardware vs.
  designed-only; update `status`.
- `korad-uart-reverse-engineering` — confirm whether the ESP32 carrier board is bench-tested
  end-to-end or still at production-files stage.
- `srm-cam` — scrub local Windows paths (`C:\Users\Mads2\…`) from the repo's docs before recruiters
  read it (repo hygiene, not a site change).
- `cadence-opamp` — confirm comfort with publishing under DTU/course policy; ensure any future
  figure exposes no PDK-confidential detail.
- Contact block (front page, `/about`, `/cv`) — a VERIFY note marks that phone/street address are
  intentionally omitted; email set to `mads28122001@hotmail.dk`.

### Open questions for Mads (from SELECTION-NOTES.md) — answered vs still open
- **Contact details** — *partially answered.* Mads supplied CVs; site now uses
  `mads28122001@hotmail.dk` (matches his CVs, not the gmail on his accounts). Phone (+45 …) and
  street address deliberately kept **off** the public site. **Still open:** whether to add a
  **LinkedIn** link.
- **Cadence publishability** — **still open.** The `cadence-opamp` page is live as described-only
  (no repo, no PDK detail); needs Mads's OK under course policy, else unlist/cut.
- **DDR3 SPD reader** — the handoff inventory listed one; it **does not exist** in any repo
  (searched all repos + Obsidian notes). Dropped. Unanswered whether it exists elsewhere.
- **AD3 overvoltage-repair / golden-board story** — mentioned in the handoff; **not documented** in
  any repo, so not written. Unanswered whether Mads has the notes/photos to support it.
- **RFID cryptanalysis as a 9th writeup** — **still open** (see §2).
- All `PHOTO NEEDED` / `VERIFY` markers await Mads's confirmation.

### Security actions flagged for Mads (from the audit; do before making those repos public)
- **`ir-blaster-standalone`** (private) — committed `secrets.yaml` with home WiFi SSID/password +
  OTA keys across history. Rotate creds + scrub history before making public. The site links only
  the clean public `ir-remote-wizard`.
- **`ha-addon-budget-dashboard`** (public) — an Enable Banking RSA private key + session ID leaked
  in commit history. Rotate those credentials. Not linked from the site.

---

## 6. Deviations from PORTFOLIO-HANDOFF.md

1. **Contact email.** Handoff/memory implied the gmail address; the site publishes
   `mads28122001@hotmail.dk` because that's what Mads's actual CVs and cover letters use. Phone and
   street address are kept off the public pages (handoff recommended no phone; extended the same
   caution to the address). These are on the PDF he sends directly.
2. **Deploy mechanism.** Handoff said "deployed from the GitHub repo on push." Implemented as a
   **GitHub Actions workflow** (`.github/workflows/deploy.yml`) that runs `wrangler pages deploy`
   against a direct-upload Pages project — rather than Cloudflare's *native* Git integration. Reason:
   the Pages project + custom domain were already created and live via `wrangler`; a native Git
   connection would have required recreating the project and re-doing the domain. The result is the
   same push-triggered CI deploy, and the workflow file is itself visible portfolio evidence. (Early
   deploys were manual `wrangler` uploads before CI was wired.)
3. **CV page.** Handoff said `/cv` is a placeholder ("CV content comes later"). Mads later supplied
   his CVs mid-session, so `/cv` now has **real content** (education, employment, grouped skills,
   languages/interests).
4. **Theme.** Site is **dark** ("blueprint" theme). The handoff didn't specify; Mads requested dark
   after an initial light "engineering paper" build.
5. **Commit attribution.** No `Co-Authored-By` / AI attribution in any commit, per Mads's explicit
   instruction. (The repo was deleted and recreated once to purge trailers that had been added
   earlier — history is now clean; contributor graph shows only `MadsRudolph`.)
6. **Cadence project** included as **described-only, no repo link** (handoff anticipated this as a
   possibility due to course confidentiality).
7. **Inventory mismatches** (handoff said "repo wins"): the **DDR3 SPD reader** and the **AD3
   repair story** from the handoff inventory don't exist in the repos, so neither was written.
8. **IR blaster** is a single combined writeup covering both the standalone firmware and the
   discovery add-on, rather than two pages.

Everything else follows the handoff: Astro + content collections, Cloudflare Pages, no
backend/framework bloat, `/projects/<slug>` URLs, filterable index, front page, `/about`, house
writeup template, `SELECTION-NOTES.md` + `MEDIA-SHOPPING-LIST.md` + README, professional commit
history.

---

## 7. Technical notes for a sibling project (the radar)

### Deep-link URL structure (what the radar's cover-letter generator needs)
- **Canonical form:** `https://madsrudolph.dev/projects/<slug>` — **no trailing slash, no `.html`**.
  (Astro is configured with `trailingSlash: 'never'` and build `format: 'file'`; Cloudflare Pages
  serves the clean URL, and `.html`/trailing-slash variants also resolve, but link to the canonical
  form.)
- **Slugs** (stable identifiers; these are the filenames of the markdown, and won't change without a
  redirect): `srm-cam`, `esp32-reflow-hotplate`, `korad-uart-reverse-engineering`, `dtu-multimeter`,
  `ir-blaster`, `regbot-studio`, `cadence-opamp`, `pi-zero-pwm-filter`.
- **Other routes:** `/` (front page, 3 featured projects + contact), `/projects` (filterable index),
  `/about`, `/cv`, `/404`. Sitemap at `/sitemap-index.xml`; `robots.txt` present.
- The `site` base is set to `https://madsrudolph.dev` in `astro.config.mjs`, so canonical `<link>`
  tags and the sitemap already use absolute production URLs.

### How deploys trigger
- Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) → `npm ci` → `npm run build` →
  `cloudflare/wrangler-action@v3` running `wrangler pages deploy dist --project-name=madsrudolph-dev
  --branch=main`. Also runnable via `workflow_dispatch`.
- **Required repo secrets:** `CLOUDFLARE_API_TOKEN` (Pages-edit scope) and `CLOUDFLARE_ACCOUNT_ID`.
  Both are set. Concurrency is limited to one deploy at a time.
- Manual fallback: `npm run build && npx wrangler pages deploy dist --project-name madsrudolph-dev
  --branch main`.
- **Practical implication for a sibling repo:** the site content is decoupled from deploy — to add
  or edit a project page, commit a markdown file and push; it's live in ~1 minute. The radar does
  **not** need Cloudflare credentials to consume the site (it's public HTTP); it only needs them if
  it intends to *write* pages, which it should do via PRs/commits to this repo, not direct uploads.

### Build tooling / stack
- **Astro** `^5.12.0` (static output). **Node 22**, **npm** (lockfile committed; CI uses `npm ci`).
- Integrations/deps: `@astrojs/sitemap` `^3.7.3`; self-hosted fonts via `@fontsource/ibm-plex-mono`
  and `@fontsource/ibm-plex-sans` `^5.2.5`. Code blocks use Shiki theme `github-dark`.
- No client framework, no backend, minimal JS (the `/projects` tag filter is ~20 lines of vanilla
  progressive-enhancement JS; the page works without it).

### Content model (how to add/modify evidence pages programmatically)
- Content collection defined in `src/content.config.ts`. One markdown file per project at
  `src/content/projects/<slug>.md`. The `<slug>` is the filename and becomes the URL.
- **Frontmatter schema (enforced at build):** `title` (string), `summary` (string), `date` (date),
  `tags` (string array — drives the filter and is the radar's match surface), `repo` (optional URL;
  omit for described-only pages like Cadence), `featured` (bool, default false), `order` (number,
  default 99 — index sort key), `status` (`working` | `in-progress` | `archived`), optional `hero`
  / `heroAlt`.
- A build (`npm run build`) validates frontmatter and will fail on schema violations — a useful gate
  if the radar auto-generates or edits pages.
