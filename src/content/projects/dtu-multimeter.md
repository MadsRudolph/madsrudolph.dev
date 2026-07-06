---
title: 'A 22-mode digital multimeter on bare-metal AVR'
summary: >-
  A from-scratch benchtop multimeter — DC/AC volts and current, resistance,
  capacitance, frequency, and a basic scope mode — built on an ATmega2560 with
  no Arduino framework, plus a fully documented KiCad design.
date: 2026-03-03
tags: ['ATmega2560', 'Bare-metal AVR', 'Embedded C', 'KiCad', 'Analog front-end', 'SPI', 'I2C', 'Measurement']
repo: 'https://github.com/MadsRudolph/personal-projects'
order: 4
status: in-progress
hero: ''
heroAlt: 'Breadboard prototype of the ATmega2560 multimeter with OLED display'
---

<!-- PHOTO NEEDED: the multimeter prototype — ATmega2560, OLED showing a reading, the analog front-end on breadboard/protoboard. -->
<div class="media-placeholder">HERO: multimeter prototype with OLED reading</div>

## What it is

A benchtop digital multimeter with 22 measurement modes — DC and AC voltage and current, resistance, capacitance, inductance, frequency, dBV/dBm, a basic oscilloscope mode, and data logging — running on an **ATmega2560 programmed in bare-metal C** (no Arduino runtime) with a 128×64 OLED. It's a from-the-ground-up design: analog front-end, firmware architecture, KiCad schematic, and a written calibration procedure.

## Problem / motivation

I wanted to understand a measurement instrument by building one, front to back — how the analog conditioning, the ADC, the ranging logic, and the firmware all have to agree for a number on the screen to mean anything. Buying a Fluke teaches you nothing about why it reads what it reads; designing the divider network, the shunt ladder, and the True-RMS window does.

## Architecture / approach

The signal path centers on an **MCP3208** 12-bit SPI ADC (eight channels), fed by:

- an 11:1 voltage divider for the 0–500 V range, plus a direct low range for millivolts;
- a resistance ladder — eight reference resistors multiplexed by a 74HC4067 — spanning 50 Ω to 50 MΩ;
- a current path with six shunts multiplexed by a CD4053, 500 µA to 10 A;
- op-amp conditioning (LM358, MCP6002), an LM311 comparator for the frequency path, an NE555 constant-current source for capacitance timing, an LM35 for temperature, and a DS1307 RTC for log timestamps.

The firmware is organized into ~17 modules — register-level SPI, TWI/I2C, UART, timers, the ADC driver, mux control, display, a software **True-RMS** engine (a 400-sample window at 20 kHz), auto-ranging, the 22-mode dispatcher, the scope mode, and EEPROM data logging. The KiCad schematic is generated programmatically with `kiutils`, links nine STEP models for the DIP parts, and passes ERC clean.

<!-- DIAGRAM NEEDED: front-end block diagram — input jacks → divider / shunt ladder / resistance mux → op-amp conditioning → MCP3208 → ATmega2560 → OLED. -->
<div class="media-placeholder">DIAGRAM: analog front-end + ADC + MCU block diagram</div>

## What went wrong and how it was diagnosed

**A UART TX deadlock on startup.** Early builds would hang during initialization. The fix (commit `6dea62e`) resolved a transmit deadlock alongside the build errors — the classic bare-metal ring-buffer/interrupt-enable ordering trap, where the TX-complete interrupt that's supposed to drain the buffer can't fire because the first byte was never kicked out, so the whole thing wedges. Writing your own UART driver means you own this bug; using `Serial.print` hides it.

**Nominal resistor values lied.** The resistance and current ranges depend on the *actual* value of the reference resistors and shunts, not their printed value. The first schematic used nominal values and the ranges read off. I measured the real shop resistors and updated the design (commit `b07c40a`) — the same reason the build guide ends with a seven-step calibration procedure (V_REF, each reference resistor, the divider ratio, the shunts, op-amp gain, the NE555 current, temperature offset) rather than trusting the BOM.

**SnapEDA footprints didn't match the real DIP parts.** Pulling symbols and footprints from a parts library introduced ERC mismatches that had to be reconciled against the physical through-hole components (commit `d776775`), which is why the project carries its own vetted symbol/footprint library instead of relying on library defaults.

## Results

- Complete system design documented: a 1,200-line spec (block diagram, 13-block build guide, 71-net table, full BOM) and a separate calibration guide.
- Firmware architecture in place across ~17 modules; ERC-clean KiCad schematic with placed, netted, routed footprints.
- Design targets: 12-bit ADC with 64× oversampling for ~15-bit effective resolution; software True-RMS for AC; a 1,000-sample scope buffer with auto-triggering.
- **Status: in progress** — roughly 12 of 16 firmware build phases done, at the breadboard-prototype stage. I'd rather show real progress and a next-steps list than claim it's finished.

<!-- VERIFY: confirm the current firmware phase count and what's measured/working on hardware vs. designed-only, so the Results section doesn't overstate. -->

## Tools & skills demonstrated

Bare-metal AVR (register-level SPI/I2C/UART, no framework), analog front-end design (dividers, shunt ladders, op-amp conditioning), ADC and oversampling, auto-ranging logic, True-RMS in software, KiCad schematic capture with programmatic generation, and the calibration discipline that makes a measurement instrument trustworthy.
