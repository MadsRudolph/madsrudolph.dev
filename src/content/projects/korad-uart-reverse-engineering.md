---
title: 'Reverse-engineering the Korad KD3005D bench supply'
summary: >-
  Finding and decoding a bench PSU's hidden UART with a logic analyzer, catching
  a floating-ground hazard with a multimeter before it destroyed hardware, and
  designing an isolation-safe ESP32 carrier board around it.
date: 2026-06-15
tags: ['Reverse engineering', 'UART', 'Logic analyzer', 'Python', 'KiCad', 'PCB design', 'Power electronics', 'Safety']
repo: 'https://github.com/MadsRudolph/personal-projects'
featured: true
order: 3
status: working
hero: ''
heroAlt: 'Analog Discovery 3 probing the Korad KD3005D internal header'
---

<!-- PHOTO NEEDED: the Korad KD3005D opened up with the Analog Discovery 3 flying leads clipped to the internal J9 header. -->
<div class="media-placeholder">HERO: AD3 probing the Korad's internal header</div>

## What it is

The Korad KD3005D is a 30 V / 5 A bench power supply. The "P" variant has a remote-control interface; the cheaper "D" variant I have does not — but the header is there on the board, unpopulated. This project is the reverse-engineering work to find that interface, decode its protocol with a [Digilent Analog Discovery 3](/projects/srm-cam) logic analyzer, and design an **ESP32 carrier PCB** that bridges it to WiFi so the supply can be driven from Home Assistant — safely, which turned out to be the whole story.

## Problem / motivation

I wanted remote control of set voltage, current, and output state on a supply that officially doesn't have it. The obvious first guess — a prominent 9-pin connector — was wrong, and the "just wire a USB-TTL adapter to it" shortcut that half the internet recommends would have destroyed my laptop's USB port. Both of those are the interesting part.

## Architecture / approach

The work came in three stages:

1. **Logic-analyzer harness.** A small Python + `pydwf` toolkit (`ad3-logic-analyzer/`) drives the AD3 as a 16-channel logic analyzer: a blind sweep, per-channel classification (idle level, edge count, minimum pulse width, bit-rate estimate), and edge-triggered capture. It exists because the interesting signals are short and you need to classify a bus before you can decode it.
2. **Protocol decode.** Capturing the real UART, identifying the framing, and confirming the command set (`*IDN?`, `VSET1:`, `ISET1:`, `VOUT1?`, `OUT1/OUT0`, `STATUS?`).
3. **Carrier PCB.** A KiCad board that level-shifts the PSU's UART to an ESP-based module and regulates its power, designed for my fiber-laser fabrication process.

<!-- DIAGRAM NEEDED: signal chain — Korad J9 UART → BS170 level shifter → ESP module → WiFi → Home Assistant, with an isolation boundary called out. -->
<div class="media-placeholder">DIAGRAM: J9 UART → level shift → ESP → WiFi, isolation boundary marked</div>

## What went wrong and how it was diagnosed

**The obvious connector was a decoy.** The 9-pin header looked like the control interface, and it lit up with activity whenever the output toggled. But a 50 MHz burst capture showed ~20 ns clock-like pulses, and the edge counts across pins were wildly asymmetric (165 edges on one line, 19 on another). A UART is a single data line with roughly balanced edges; a clocked, multi-line, asymmetric bus is a *synchronous* interface — this was the internal MCU-to-power-board bus, not remote control. Ruling it out was as valuable as finding the real one. The actual interface was a separate 4-pin header (VSS / RX / TX / VDD) that idles **high**, the opposite of the 9-pin's idle-low, running plain ASCII at **9600 8N1** — not the 115200 I'd first assumed.

**The ground pin floats up to the output voltage.** This is the one that mattered. I'd initially assumed the UART's VSS sat at the negative output terminal — a normal ground. A quick multimeter check on the bench said otherwise: **VSS tracks the output voltage and rides up to +30 V as you turn the knob.** Any earth-referenced USB-TTL adapter clipped to that "ground" would bridge up to 30 V of common-mode straight into a laptop's USB port and destroy both the adapter and the port. This is exactly why every factory remote daughterboard for these supplies carries optocouplers. My earlier notes had said "no isolation needed" — the bench measurement overturned that, and I retracted it. The carrier design's only safe options became: a USB isolator, optocoupler bridges, or (what I chose) WiFi with no wired host at all.

**Not every "D" unit even answers.** Chasing down folklore about the firmware, I found that some "D" units never respond on the UART — TX stuck high forever — regardless of wiring. A live poll is the only way to know; the presence of the header doesn't guarantee a functioning interface. I flagged the single-source claims I couldn't corroborate rather than repeating them as fact.

## Results

- Correct interface identified (4-pin J9), protocol decoded: **9600 8N1**, custom poll-only ASCII, ~100–200 ms command pacing.
- The floating-ground hazard caught **before** any hardware was damaged, and documented with the bench measurement that proves it.
- ESP32 carrier PCB: ERC-clean schematic, fully routed, with production Gerbers and mirrored DXF exported for fiber-laser etching. Level-shifting via BS170, LM317 logic regulator trimmed to 3.27 V, power-source jumper for 3.3 V vs 5 V J9 variants.

<!-- PHOTO NEEDED: the milled/etched ESP32 carrier board, populated. Also: a WaveForms screenshot of the decoded UART frame would be a strong figure. -->
<div class="media-placeholder">PHOTO: populated carrier board + a decoded-UART scope capture</div>

<!-- VERIFY: has the carrier board been fabricated and bench-tested end-to-end (ESP ↔ PSU ↔ Home Assistant), or is it still at the production-files stage? Adjust wording + status if so. -->

## Tools & skills demonstrated

Protocol reverse engineering, logic-analyzer methodology (classify before you decode), the discipline to verify an assumption with a meter instead of trusting a datasheet guess or a forum post, KiCad PCB design for an in-house laser process, and safe handling of floating measurement domains.
