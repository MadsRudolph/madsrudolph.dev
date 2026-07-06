---
title: 'ESP32 reflow hotplate, designed from scratch'
summary: >-
  A 24 V DC SMD reflow hotplate built around an ESP32 and a CNC-milled control
  board — with a unit-tested PID core, a layered safety watchdog, and copper
  sized by IPC-2221 for 13 A.
date: 2026-06-30
tags: ['Embedded C', 'ESP32 / ESP-IDF', 'KiCad', 'PID control', 'Power electronics', 'Safety-critical', 'Firmware testing', '3D CAD']
repo: 'https://github.com/MadsRudolph/esp32-reflow-hotplate'
featured: true
order: 2
status: in-progress
hero: ''
heroAlt: 'ESP32 reflow hotplate control board and heater plate'
---

<!-- PHOTO NEEDED: the assembled hotplate — control board, heater plate, OLED + rotary encoder, 24V PSU. Landscape hero shot. -->
<div class="media-placeholder">HERO: assembled reflow hotplate</div>

## What it is

A benchtop reflow hotplate for soldering SMD boards, built entirely from parts in the DTU component shop. It heats a plate to a programmed reflow profile (preheat → soak → reflow → cool) using a **24 V DC PTC heater** switched by a MOSFET, closes the loop with a K-type thermocouple, and is controlled by an ESP32 on a **single-sided control board I milled myself**. No mains voltage touches the design — the whole thing runs from a 24 V brick, which makes it safe to probe on the bench.

## Problem / motivation

Reflowing boards with a hot air gun is fiddly and uneven, and commercial hotplates are either expensive or built around switched mains and a black-box controller. I wanted one I could build in-house, debug safely, and — most importantly — trust not to cook a board or start a fire if the firmware hung. The interesting engineering isn't "turn on a heater"; it's making the control and safety logic correct enough to leave running unattended.

## Architecture / approach

The control core is written as **pure C with no ESP-IDF dependencies**, so the safety-critical logic can be compiled and unit-tested natively on a desktop before it ever runs on hardware:

- `pid.c` — position-form PID with anti-windup and derivative-on-measurement.
- `safety.c` — over-temp cutoff, thermal-runaway detection, thermocouple-fault and sensor-stall watchdogs; faults latch.
- `reflow.c` — the profile state machine.
- `actuator.c` — split-range output mapping (heat above +5% effort, cool a fan below −5%, deadband between).
- `settings.c` — NVS-persisted profiles (Sn63/Pb37 and SAC305 presets).

Above that sits the ESP-IDF layer: OLED + rotary-encoder UI, and a WiFi dashboard serving a small single-page app with REST profile editing and WebSocket telemetry.

The **hardware** is a KiCad single-sided board (0 DRC violations) with a two-stage BS170 gate driver, an IRFS4710 heater MOSFET (14 mΩ R<sub>DS(on)</sub>), a MAX31855 thermocouple amp, and a buck logic supply. The enclosure is modeled in Blender and FDM-printed with metal standoffs, since the plate reaches ~250 °C.

<!-- DIAGRAM NEEDED: control-board block diagram — 24V in → buck (5V logic) + linear (12V gate drive), ESP32 → gate driver → IRFS4710 → heater; thermocouple → MAX31855 → ESP32. -->
<div class="media-placeholder">DIAGRAM: power + control block diagram</div>

## What went wrong and how it was diagnosed

The whole point of the firmware architecture was to be able to write these failures down as *tests*, so each of these is backed by a regression test in the suite (~1,300 lines of Unity tests):

**Derivative kick at every stage boundary.** A textbook PID computes the derivative on the error, so when the setpoint jumps 150 °C → 200 °C at a profile stage boundary, the derivative term spikes and slams the heater. Switched to derivative-on-*measurement* (`D = −Kd·Δmeas/dt`), which ignores setpoint steps entirely. `test_deriv_on_measurement_no_setpoint_kick` pins it: identical PID output when the setpoint jumps but the measurement is steady.

**A stalled loop divided by zero and stuck the heater on.** If the main loop skips a tick, `dt` is 0 and the derivative term divides by zero → `Inf` → the output computation fails and the heater holds its last value. Guarded the derivative behind `dt > 0`, and added a finite-check that forces the output to *heater-off* if the result is ever NaN/Inf. `test_output_never_nan` feeds an adversarial sequence (dt = 0, measurements of ±1e30) and asserts every call returns a finite, clamped value. This is a silent failure mode that could ruin a board mid-reflow, and it only shows up if you go looking for it.

**Thermal-runaway detection tripping on boot.** The runaway watchdog says "if the heater is >50% duty and the temperature hasn't risen ≥2 °C over a 20 s window, fault out." The first version opened its measurement window on the very first heater-on tick — where `dt` can be huge (scheduler hiccup) or zero (stall), breaking the rise calculation. Fixed by deferring the window to the *second* heater-on tick and scaling the minimum-rise threshold against the actual elapsed window time rather than a hard-coded 20 s.

**Boot-time gate safety, verified by topology.** An ESP32 GPIO floats during boot, and a floating gate must not turn the heater on. The two-stage gate driver is arranged so that a floating input is pulled to ground, which through the second stage clamps the main gate low — heater off — by construction rather than by timing. I worked this through in the electrical-calcs doc rather than discovering it with a scorched board.

## Results

- Schematic and single-sided PCB complete, 0 DRC violations.
- PID + safety core complete with a passing native unit-test suite covering the failure modes above.
- Power budget worked out on paper: ~310 W into the heater at 13 A, ~2.4 W conduction loss in the MOSFET, 13 A copper sized to 8–10 mm pours via the IPC-2221 external-layer formula (with margin for laser/mill under-etch).
- **Status: board not yet fabricated.** Pending a revision to add the cooling-fan PWM output before the first cut.

<!-- VERIFY: confirm current build status when photos are shot — is the board milled/populated yet, or still pre-fab? Update `status:` in the frontmatter accordingly. -->

## Tools & skills demonstrated

Embedded C, PID control and tuning, safety-critical design (latching watchdogs, fail-safe defaults), power electronics and thermal design, IPC-2221 copper sizing, gate-drive design, KiCad, native unit testing of firmware, and 3D CAD for the enclosure.
