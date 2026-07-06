---
title: 'RegBot Studio: a modern web GUI for a control-systems robot'
summary: >-
  A full-stack replacement for a 4,700-line legacy PyQt GUI driving DTU's REGBOT
  balance robot — FastAPI + React, with live Bode/step/Nyquist simulation and a
  strictly layered backend.
date: 2026-04-22
tags: ['Python / FastAPI', 'React / TypeScript', 'Control theory', 'WebSocket', 'Async serial', 'Full-stack', 'python-control']
repo: 'https://github.com/MadsRudolph/regbot-studio'
order: 6
status: working
hero: ''
heroAlt: 'RegBot Studio control tab with a live Bode plot'
---

<!-- PHOTO/SCREENSHOT NEEDED: the RegBot Studio UI — the Control tab with live Bode plot, or the drag-and-drop mission builder. A screen recording GIF would be even better. -->
<div class="media-placeholder">HERO: RegBot Studio control tab with live Bode plot</div>

## What it is

The REGBOT is a Teensy-based two-wheel balancing robot used in DTU's *34722 Linear Control Design 1* course. Its stock interface is a ~4,700-line PyQt5 desktop GUI. **RegBot Studio is a full-stack web replacement** — a FastAPI backend and a React/TypeScript front-end — that adds live frequency-response analysis, a drag-and-drop mission builder, and telemetry overlay, while staying protocol-compatible with the real robot.

## Problem / motivation

The legacy GUI works but is hard to extend, and the course is fundamentally about control theory — Bode plots, step responses, stability margins — that the old tool couldn't show you *live* as you tuned the controllers. I wanted an interface where you could adjust a cascaded controller and immediately see what it did to the closed-loop response, backed by an architecture clean enough to keep growing.

## Architecture / approach

The backend is deliberately layered with one-way dependencies, enforced in CI by import-linter:

1. **Transport** — async serial/TCP client to the Teensy.
2. **Protocol** — event decoder and mission encoder.
3. **Domain** — pure pydantic models (Controller, Mission, RobotState), no I/O.
4. **Simulation** — a plant model transcribed from the course's reference MATLAB/Simulink model, wrapped around `python-control` for Bode/step/Nyquist.
5. **Stores** — disk persistence, including an importer for the legacy `regbot.ini` format.
6. **Services / API** — an event bus and FastAPI routers exposing REST plus a WebSocket telemetry stream at 20–50 Hz.

The front-end is React 18 + TypeScript (Vite, Zustand, Plotly) with tabs for control, mission building, calibration, logging, and simulation. A single backend client owns the USB connection so the browser never touches the serial port directly.

## What went wrong and how it was diagnosed

**Porting battle-tested protocol code without breaking it.** The riskiest part of a rewrite is the wire protocol — the CRC framing and command decoder in the legacy code work, and any subtle difference means the robot silently misreads packets. I ported the decoder logic and the CRC scheme (a sum-based check in the range 1–99) essentially byte-for-byte rather than reimplementing them, and pinned the behavior with a round-trip framing test (`test_crc.py`) that validates against the original logic. The auto-generated Qt Designer UI, by contrast, was deliberately thrown away — there's no value in preserving 300 KB of generated widget code when the whole point is a new front-end.

**Trusting the simulation meant validating it.** The Bode/step/Nyquist previews are only useful if the plant model is faithful, so the model transcribed from Simulink is checked in `test_simulation.py` against committed controller gains — the closed loop has to show the expected stability margins and not, say, ring or go unstable where the real tuning is fine.

## Results

- Full-stack app: ~2,800 lines of backend Python, ~3,700 of front-end TypeScript, with a test suite covering CRC framing, log parsing, and simulation stability.
- Live control-theory feedback — adjust a controller, see the Bode/step/Nyquist response update — which the legacy GUI never offered.
- Strict layered architecture enforced automatically, and backward compatibility with the existing `regbot.ini` presets.
- MIT-licensed, crediting the original GUI's author for the protocol logic it builds on.

## Tools & skills demonstrated

Full-stack development (async FastAPI + React/TypeScript), real-time telemetry over WebSocket, control-systems knowledge applied in software (transfer functions, Bode/Nyquist, stability margins via `python-control`), disciplined legacy-code integration, and architecture that's enforced rather than merely intended.
