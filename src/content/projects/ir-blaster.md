---
title: 'ESP32 IR remote wizard'
summary: >-
  An ESP32 remote with learn, save, and send functions, paired with a Home Assistant tool for discovering infrared codes.
date: 2026-04-07
tags: ['Embedded C++', 'ESPHome component', 'ESP32', 'Python / FastAPI', 'IR protocols', 'State machine', 'SPIFFS', 'Home Assistant']
repo: 'https://github.com/MadsRudolph/ir-remote-wizard'
order: 5
status: working
hero: ''
heroAlt: 'ESP32 IR blaster board with the web UI open on a phone'
---

Personal project combining embedded firmware with a Python discovery service and the Flipper-IRDB code library.

## The challenge

Codes that looked valid did nothing on real devices. Fixing Samsung bit order and frame layout, plus Sony repeat timing, made the transmitted commands usable.

## Results

- Learn/save/send and persistence across reboots tested on a Schiit Saga preamp.
- Discovery support for about **14 IR protocols**.
- Home Assistant add-on released through **v0.7.5**.

[Code, design files & full documentation →](https://github.com/MadsRudolph/ir-remote-wizard)
