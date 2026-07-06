---
title: 'IR remote wizard: ESP32 firmware + a code-discovery add-on'
summary: >-
  A standalone ESP32 IR blaster written as a proper ESPHome component, paired
  with a Home Assistant add-on that discovers IR codes from the Flipper-IRDB
  database — where most of the work was getting IR protocol encoding right.
date: 2026-04-07
tags: ['Embedded C++', 'ESPHome component', 'ESP32', 'Python / FastAPI', 'IR protocols', 'State machine', 'SPIFFS', 'Home Assistant']
repo: 'https://github.com/MadsRudolph/ir-remote-wizard'
order: 5
status: working
hero: ''
heroAlt: 'ESP32 IR blaster board with the web UI open on a phone'
---

<!-- PHOTO NEEDED: the ESP32 IR blaster hardware (IR LED + receiver) with the web UI open on a phone showing the button grid. -->
<div class="media-placeholder">HERO: IR blaster board + web UI on a phone</div>

## What it is

Two related pieces that solve one problem — controlling any IR device when you've lost the remote or want it on your network:

- **`ir-blaster-standalone`** — firmware for an ESP32 IR blaster, written as a first-class **ESPHome external component** (not an Arduino sketch): a web UI served from flash, a REST API, learn-and-replay of IR codes, and persistent device profiles in SPIFFS. Runs with no Home Assistant required.
- **`ir-remote-wizard`** — a Home Assistant add-on (Python/FastAPI) that auto-discovers codes for a device from the **Flipper-IRDB** database, bulk-tests power codes until one works, then walks you through the individual buttons and generates the Home Assistant scripts.

Together they took a couple of thousand lines of C++ and over four thousand of Python across a real release history (the add-on is at v0.7.5).

## Problem / motivation

IR is deceptively hard. "Send the power code" hides a dozen protocol-specific encodings, each with its own bit order, frame format, and repeat behavior, and the failure mode is silent — the TV just doesn't respond and you have no idea whether the code, the encoding, or the LED is wrong. I wanted a system where discovery was automatic and the encoding was actually correct, which meant getting into the protocol details.

## Architecture / approach

**Firmware side:** the ESPHome component wraps ESPHome's IR TX/RX primitives, routes a small REST API through a custom async HTTP handler, and persists a flat JSON array of device profiles to SPIFFS. A learn mode captures codes from a physical remote across a dozen protocols (NEC and variants, Samsung, Sony SIRC, RC5/RC6, LG, Panasonic, JVC, and more).

**Add-on side:** a FastAPI app drives a session **state machine** (connect → device type → brand → discover → results), builds an SQLite database from Flipper-IRDB at image-build time, talks to the ESP32 over ESPHome's native API (`aioesphomeapi`), and translates each Flipper protocol string into the right ESPHome service call.

<!-- DIAGRAM NEEDED: firmware ↔ Python client ↔ Home Assistant, with the Flipper-IRDB database feeding the wizard. -->
<div class="media-placeholder">DIAGRAM: firmware ↔ wizard ↔ Home Assistant + Flipper-IRDB</div>

## What went wrong and how it was diagnosed

Almost every bug was a protocol-encoding bug, and each one is invisible until you test against a real device:

**Samsung codes did nothing — two bugs at once.** Samsung TVs were completely unresponsive. The converter had two independent faults: it was missing the LSB→MSB bit reversal (Flipper stores codes LSB-first, ESPHome expects MSB-first), and it used the wrong frame layout (`addr + ~addr` instead of Samsung32's `addr + addr + cmd + ~cmd`). A power code that should have encoded to `0xE0E040BF` was coming out as garbage. Fixing both the bit order and the frame format brought the entire Samsung protocol back.

**Sony devices ignored single presses.** Sony's SIRC protocol requires each command to be sent at least three times with ~45 ms gaps to register — a single transmission is spec-legal but ignored by the device. Added an explicit repeat count (default 1, set to 3 for SIRC) with the inter-frame delays. SIRC also needed its own LSB-first bit reversal, same root cause as Samsung but a different protocol.

**NEC frames decoded as JVC.** On the firmware side, NEC-encoded frames were malformed — a loopback decode came back as JVC instead of NEC. ESPHome's NEC encoder defaults to zero command-repeats, which omits the repeat frame and leaves an invalid burst. Hard-coding one repeat fixed it. NEC is the most common TV protocol, so this one mattered.

**The learn mode drowned in noise.** During discovery the wizard was being spammed with false Pronto/CanalSat decodes coming off electrical noise on the protoboard, because the receiver defaulted to dumping *every* protocol it thought it saw. Setting the receiver's dump list to empty (the real protocol handlers were already gated behind a listen-mode flag) cleaned up the logs and killed the false positives.

**ESP-IDF's web server rejected JSON POSTs.** Getting the standalone firmware's REST API to work meant discovering that ESP-IDF's HTTP server is stricter than Arduino's — it wouldn't invoke the body handler for `application/json`, and it has no DELETE method at all. Both needed workarounds (reading the raw request body directly; routing deletes through POST endpoints).

## Results

- Standalone firmware verified end-to-end on real hardware (learn, save, send, persistence across reboots) on a Schiit Saga preamp.
- Add-on shipped through a real release history to v0.7.5, with ~14 IR protocols mapped from Flipper-IRDB and script/dashboard generation for Home Assistant.
- A clean split: low-level ESP-IDF firmware on one side, a stateful Python discovery service on the other.

<!-- SECURITY / VERIFY: the `ir-blaster-standalone` repo is currently PRIVATE and its git history contains a committed secrets.yaml (home WiFi SSID/password + OTA keys). Do NOT make it public or link it until that history is scrubbed (git filter-repo) and the credentials are rotated. This page links the public, clean `ir-remote-wizard` repo only. -->

## Tools & skills demonstrated

Firmware architecture beyond sketch level (a real ESPHome component, async HTTP, SPIFFS persistence), IR protocol internals (bit order, frame formats, repeat timing) debugged against real devices, Python/FastAPI with a session state machine, database-backed discovery, and the ESP-IDF vs. Arduino distinctions that only surface when you leave the training wheels behind.
