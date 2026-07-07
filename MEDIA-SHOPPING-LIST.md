# Media shopping list

Every image and diagram the site needs, and every fact that needs confirming, gathered so you can
shoot it all in one session. Each writeup has clearly-marked placeholders in the source
(`<!-- PHOTO NEEDED -->`, `<!-- DIAGRAM NEEDED -->`, `<!-- VERIFY -->`); this is the consolidated
checklist.

**Photo tips:** shoot landscape, good light, ~1600 px wide minimum, plain background where you can.
Hero images are the first thing a recruiter sees — make those count. Scope/WaveForms captures and
measurement plots are strong evidence; include them wherever you have them.

Once a photo is shot, drop it in `public/media/<slug>/` and replace the matching
`<div class="media-placeholder">…</div>` in the writeup with a normal Markdown image, e.g.
`![Alt text describing the photo](/media/srm-cam/hero.jpg)`. Also fill in the `hero:` /
`heroAlt:` frontmatter fields if you want a card thumbnail later.

---

## Photos to shoot

### srm-cam
- [ ] **HERO** — SRM-CAM GUI (3D toolpath preview) on screen with the Roland SRM-20 cutting a board behind it. Landscape.
- [ ] A finished **double-sided milled board**, close-up: clean isolation traces and registered vias.

### esp32-reflow-hotplate
- [ ] **HERO** — the assembled hotplate: control board, heater plate, OLED + rotary encoder, 24 V PSU.

### korad-uart-reverse-engineering
- [ ] **HERO** — the Korad KD3005D opened up, Analog Discovery 3 flying leads clipped to the internal J9 header.
- [ ] The populated **ESP32 carrier board** (milled/etched).
- [ ] **WaveForms screenshot of the decoded UART frame** — strong figure if you still have the capture.

### dtu-multimeter
- [ ] **HERO** — the prototype: ATmega2560, OLED showing a reading, analog front-end on breadboard/protoboard.

### ir-blaster
- [ ] **HERO** — the ESP32 IR blaster hardware (IR LED + receiver) with the web UI open on a phone showing the button grid.

### regbot-studio
- [ ] **HERO** — a screenshot of the UI: the Control tab with a live Bode plot, or the drag-and-drop mission builder. A short screen-recording GIF would be even better.

### pi-zero-pwm-filter
- [ ] **HERO** — the protoboard filter next to the Pi Zero, plus one measured frequency-response capture.
- [ ] The saved **left/right channel** and **filter-response** plots you referenced.

---

## Diagrams to make

These are block diagrams I can draft as clean inline SVG from the descriptions in each writeup —
just say the word and I'll add them (no photo needed). Or you can supply your own.

- [ ] **srm-cam** — pipeline: KiCad → Gerber/Excellon → parse → toolpath → registration/leveling → G-code/RML → SRM-20.
- [ ] **esp32-reflow-hotplate** — power + control: 24 V → buck (5 V logic) + linear (12 V gate drive); ESP32 → gate driver → IRFS4710 → heater; thermocouple → MAX31855 → ESP32.
- [ ] **korad-uart-reverse-engineering** — signal chain: J9 UART → BS170 level shifter → ESP module → WiFi → Home Assistant, with the isolation boundary marked.
- [ ] **dtu-multimeter** — analog front-end: input jacks → divider / shunt ladder / resistance mux → op-amp conditioning → MCP3208 → ATmega2560 → OLED.
- [ ] **ir-blaster** — firmware ↔ Python wizard ↔ Home Assistant, with Flipper-IRDB feeding the wizard.

---

## Facts to confirm (VERIFY markers)

Nothing on the site invents a measurement, but a few numbers and status flags are pulled from repo
docs/commits and should be confirmed against reality before you send the link to an employer:

- [ ] **pi-zero-pwm-filter** — confirm the two headline numbers from your saved captures: **−40.6 dB PWM attenuation @ 31.25 kHz** and the **~75% / −22.6 dB ALSA operating point**. Swap in the real plots.
- [ ] **esp32-reflow-hotplate** — current build status when you shoot the photo: is the board milled/populated yet, or still pre-fab? Update the `status:` frontmatter (`in-progress` vs `working`) to match.
- [ ] **dtu-multimeter** — confirm the firmware phase count (~12/16) and what's actually measured/working on hardware vs. designed-only, so Results doesn't overstate. Update `status:` if needed.
- [ ] **korad-uart-reverse-engineering** — has the carrier board been fabricated and tested end-to-end (ESP ↔ PSU ↔ Home Assistant), or is it still at the production-files stage? Adjust wording + `status:`.
- [ ] **srm-cam** — scrub local Windows paths (`C:\Users\Mads2\...`) from the repo's `docs/` and packaging files before recruiters read it. Then this writeup's VERIFY note can be removed.
- [ ] **Contact details** (front page + `/about`) — confirm the email to publish and whether to add LinkedIn. See open questions in `SELECTION-NOTES.md`.

## Security actions (from the audit — do these before the related links go public)

- [ ] **ir-blaster-standalone** (private): rotate the leaked WiFi/OTA credentials, scrub `secrets.yaml` from git history, then it can be made public. The writeup links only the clean `ir-remote-wizard` until then.
- [ ] **ha-addon-budget-dashboard** (public): rotate the Enable Banking key/session leaked in history. Not linked from this site.
