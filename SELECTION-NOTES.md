# Project selection notes

Audit of every repo on GitHub user **MadsRudolph** (36 repos, public + private), scored for
real engineering substance, quality of debugging stories, and fit for a Danish
electronics/embedded hiring audience. Eight projects were selected for full writeups. Rationale
for every include and every notable exclude is below.

The rule applied throughout: **depth beats breadth**, and the repo wins over memory — where the
handoff's inventory disagreed with what's actually in the repos, the repos decided.

---

## Selected (8 writeups)

| # | Slug | Why it's in |
|---|------|-------------|
| 1 | `srm-cam` | The strongest single artifact. A real CAM tool (~14k LOC + 6k LOC tests) with a reverse-engineered SPI machine interface and a deep bench of failure→diagnosis→fix stories (kerf compensation, board-bow leveling, spindle-spinup endmill breakage, V-bit width geometry). Public repo. **Featured.** |
| 2 | `esp32-reflow-hotplate` | From-scratch hardware + firmware. Unit-tested PID core, layered safety watchdog, IPC-2221 copper sizing, gate-drive boot safety. Exactly the profile embedded employers want, and the debugging is backed by regression tests. Public. **Featured.** |
| 3 | `korad-uart-reverse-engineering` | Best pure debugging narrative: ruled out a decoy connector by edge-count analysis, then caught a floating-ground hazard with a multimeter *before* it destroyed a laptop USB port, and overturned his own earlier wrong note. Protocol RE + logic-analyzer method + a safety-driven PCB. Lives in the public `personal-projects` monorepo. **Featured.** |
| 4 | `dtu-multimeter` | Bare-metal AVR (no Arduino framework), a real analog front-end, and a written calibration procedure. Honest "in progress" status (≈12/16 firmware phases). Shows measurement-instrument depth. In `personal-projects`. |
| 5 | `ir-blaster` (standalone + wizard) | Proves firmware architecture beyond sketch level (a real ESPHome component, SPIFFS, async HTTP) plus a stateful Python discovery service. Debugging is all protocol-encoding detail (Samsung32 bit-order + frame format, Sony SIRC repeats, NEC repeat frame). See security note below. |
| 6 | `regbot-studio` | Full-stack breadth + control-theory depth (live Bode/Nyquist via `python-control`), a strictly layered backend enforced in CI, and disciplined legacy-protocol porting. Public, MIT, clean. |
| 7 | `cadence-opamp` (described-only, **no repo link**) | Analog IC design exposure (180 nm CMOS, Cadence, SKILL/Spectre) with a genuinely collaborative Git-synced two-user workflow. Valuable for analog/mixed-signal employers (Oticon/Demant, etc.). Repo stays private — see confidentiality note. |
| 8 | `pi-zero-pwm-filter` | Deliberately included as an *early* project to show trajectory: analog Sallen-Key filter design where the point is that he measured it (PWM attenuation, ALSA operating point) rather than trusting his ears. In `personal-projects`. |

### Skill coverage across the eight
Mechatronics/CAM · power electronics + thermal · protocol reverse engineering + test instrumentation ·
bare-metal measurement · IoT firmware architecture · full-stack + control theory · analog IC design ·
analog audio. Little overlap, which is the goal.

---

## Considered but not given a full writeup

**Strong repos held in reserve** (any could become a 9th writeup, or a combined "home lab" page):

- `rfid-card-reader` (in `personal-projects`) — MFRC522 + MIFARE Classic cryptanalysis (nested/darkside/mfkey32) on bare-metal ATmega328P with a Python GUI. Genuinely impressive and embedded-heavy. Held back only because (a) eight was already a strong set, and (b) the security/dual-use framing needs a careful, defensive tone for a general hiring audience. **Recommend adding if Mads wants a security angle** — flag for a follow-up.
- `xiaomi-s400-ble` / `esp32-soil-moisture` / `esp32-ir-blaster` notes / `component-inventory` — all real, all in `personal-projects`. Good "home lab" supporting cast; fold into a combined page later rather than diluting the top eight now.
- `ad3-logic-analyzer` — excellent reference-quality tooling, but it's the *instrument* behind the Korad writeup, so it's cited there rather than given its own page.

**Software dashboards — excluded from writeups** (`budget-dashboard`, `health-dashboard`, `spotify-addon`,
`ha-addon-budget-dashboard`): substantial software, but the audience is electronics/embedded and these are
pure app work. More importantly, two have **secret-exposure history** (see below). Not linked.

**Coursework / reports / exam tools — excluded** (`DTU`, `PWA`/`PWB`/`PWF`, `Measurement-report`,
`Metaldetektor-Projekt`, `lcd1-solver`, `lcd1-exam-suite`, `block-diagram-reducer`, `REGBOT-Balance-assignment`,
`Design-af-opamp-analog-ic-2`, `Basic_C_Programming`, `Microcontroller`): LaTeX reports, exam-cram utilities, or
course dumps without a standalone engineering narrative. `regbot-studio` and `cadence-opamp` already represent
the control and analog-IC coursework at their strongest.

**`mosen`** — a working Python/Dash bar-inventory app, but it's business software (out of scope) with
acknowledged open bugs and no hardware. Excluded.

**`Componentbot` / `DTU-PCB-prototyping`** — the component-shop LLM helper is a thin utility; the PCB guide is
excellent technical writing but it's documentation, not engineering. The guide is linked from `/about` as
supporting evidence of the fabrication workflow rather than given its own writeup.

**`SPICEPilot` / `spicepilot-kicad` / `Sourdough_SideKick` / `Swamp` / `MadsRudolph` / `Blender` / `iot-ex13` /
`62768-energy-system` / `KiCad-components`** — research-adjacent, collaborative-course, profile-readme, or
asset repos; none carry a first-person hardware-debugging story strong enough for the top set.

---

## Security & confidentiality findings (action required before some links go live)

These came out of the audit and **must be resolved by Mads** — the site does not link anything unsafe as
shipped, but two items need action before the corresponding repos could ever be made public:

1. **`ir-blaster-standalone` is PRIVATE and has committed secrets in history.** `secrets.yaml` contains a home
   WiFi SSID (which is a street address), WiFi password, and OTA/API keys, present across multiple commits.
   The `ir-blaster` writeup therefore links **only** the clean, public `ir-remote-wizard` repo. Before making
   the standalone repo public: rotate all those credentials, `git filter-repo --path secrets.yaml
   --invert-paths` to scrub history, add `secrets.yaml` to `.gitignore`, and ship a template instead.

2. **`ha-addon-budget-dashboard` (PUBLIC) leaked an Enable Banking RSA private key + session ID** in commit
   `2ee8e1f`. It was removed in a later commit, but it is permanently in the public GitHub history. **Rotate
   those banking credentials.** Not linked from this site regardless. (`budget-dashboard` and `health-dashboard`
   are private and currently clean in-tree.)

3. **`cds` (Cadence) must stay private.** It transitively depends on the X-FAB XT018 PDK, which is NDA-protected
   and licensed to Mads only through DTU, and the Cadence design DB is binary and can't be redacted. The
   `cadence-opamp` page is **described-only with no repo link** for this reason.

4. **`srm-cam` — minor:** a few `docs/` and packaging files contain local Windows paths (`C:\Users\Mads2\...`).
   Harmless, but worth a find-and-replace before recruiters read the repo. Flagged with a `VERIFY` comment on
   the writeup.

5. **`personal-projects` — housekeeping:** a committed shell-accident file named
   `Resources" && mv C:UsersMads2...` (~1 MB) should be `git rm`'d. No secrets, just noise.

No secrets were found in `srm-cam`, `esp32-reflow-hotplate`, `regbot-studio`, `ir-remote-wizard`,
`pi-zero-room-sensor`, or the `personal-projects` hardware sub-projects.

---

## Open questions for Mads

1. **Contact details.** The site currently publishes `mads28122001@gmail.com` and the GitHub profile
   (recommended: no phone number). Do you want a **LinkedIn** link added, and is a **dedicated email** (e.g.
   `mads@madsrudolph.dev`) preferred over the Gmail? Placeholders are flagged with `VERIFY` on `/` and `/about`.
2. **Cadence page.** Are you comfortable publishing even the described-only version given DTU/course policy? If
   there's any doubt, we can unlist `/projects/cadence-opamp` or cut it.
3. **A DDR3 SPD reader** was in the handoff inventory but **does not exist** in any repo (searched all repos +
   Obsidian notes). Dropped. If it's on a different account or local-only, point me at it.
4. **The AD3 repair story** (12 V overvoltage + golden-board comparison) mentioned in the handoff **isn't
   documented** in any repo either. It's a great story — if you have the notes/photos, it could strengthen the
   Korad or a standalone test-equipment writeup.
5. **RFID cryptanalysis** — want it added as a 9th writeup (security/embedded angle), or kept out to keep the
   set tightly hardware-focused?
6. Confirm every `VERIFY`/`PHOTO NEEDED` marker (see `MEDIA-SHOPPING-LIST.md`) — especially unverified
   measurements in `pi-zero-pwm-filter` and current build status on `esp32-reflow-hotplate` and `dtu-multimeter`.
