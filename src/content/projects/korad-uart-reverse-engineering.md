---
title: 'Korad bench supply: hidden UART'
summary: >-
  Reverse-engineering a bench supply’s remote interface and designing a wireless carrier board around its floating ground.
date: 2026-06-15
tags: ['Reverse engineering', 'UART', 'Logic analyzer', 'Python', 'KiCad', 'PCB design', 'Power electronics', 'Safety']
repo: 'https://github.com/MadsRudolph/personal-projects'
featured: true
order: 3
status: working
hero: ''
heroAlt: 'Analog Discovery 3 probing the Korad KD3005D internal header'
---

Personal project. I used a logic analyzer and multimeter to identify the interface and decode its commands.

## The challenge

The interface ground rose with the output voltage, reaching **30 V**. That measurement overturned my original grounding assumption and changed the carrier design to wireless control without a wired host.

## Results

- Identified the four-pin **J9** interface: **9600 8N1**, polled ASCII.
- Documented command pacing and differences between supply variants.
- Created an ESP32 carrier schematic, layout, and production files.

**Current status:** Interface investigated; full carrier-board bring-up is not documented here.

[Code, design files & full documentation →](https://github.com/MadsRudolph/personal-projects)
