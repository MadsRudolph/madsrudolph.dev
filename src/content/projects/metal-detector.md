---
title: 'VLF Metal Detector: induction-balance sensing with real-time DFT phase detection'
summary: >-
  A very-low-frequency induction-balance metal detector built on an ATmega328P.
  A single-bin DFT reads the phase of the received-coil signal in real time to
  tell ferrous from non-ferrous metal, driven by an H-bridge transmitter and a
  concentric bucking-coil head.
date: 2026-04-15
tags: ['DSP', 'C / firmware', 'ATmega328P', 'KiCad', 'Analog electronics', 'Coursework']
repo: 'https://github.com/Skab101/34621-Metal-Detector'
featured: false
order: 10
status: working
---

## What it is

A working VLF (very-low-frequency) **induction-balance metal detector**, built for DTU's **34621 Electromagnetic Sensors & Digital Signal Processing** course. A transmitter coil is driven at 2 kHz; a receiver coil picks up the field re-radiated by nearby metal; and the firmware runs a **single-bin DFT** on the sampled receiver signal to recover its amplitude *and phase*. The phase is what matters — it's how the detector distinguishes ferrous from non-ferrous metal, not just "there's something there." Output goes to an OLED HUD and a variable-tone buzzer.

This was a four-person group project; I was the top contributor and worked across the DSP firmware, the coil/driver electronics, and the board.

## How it works

- **Transmitter:** an H-bridge (IRF5305 / IRL530) drives the TX coil with a 2 kHz square wave.
- **Coil head:** concentric TX/RX coils in a **bucking** configuration — a small opposing coil cancels the direct TX→RX coupling so the receiver sees (ideally) *only* the field from the target.
- **Acquisition:** the 10-bit ADC samples at 8 kHz — **4× oversampling** of the 2 kHz carrier, coherently locked to the drive so each DFT window lands on whole cycles.
- **DSP core:** a single-bin DFT (a Goertzel-style evaluation at just the carrier frequency) gives the in-phase and quadrature components, from which amplitude and phase are computed every window. An IIR smoother tames the noise before the phase is classified.
- **Feedback:** an SSD1306 OLED shows a live readout; a buzzer changes tone with proximity.

## The hard parts

The whole detector lives or dies on two things, and neither is in the textbook:

- **Nulling the bucking coil.** Induction balance only works if the direct TX→RX coupling is cancelled to near-zero, so the tiny target signal isn't buried under a huge carrier. Getting the concentric coils and the bucking winding physically balanced — and keeping them balanced — is fiddly, and any residual imbalance sets the noise floor for everything downstream.
- **A phase reading that doesn't wander.** Single-bin phase detection is only clean if the sampling is coherent with the drive; drift or a non-integer number of cycles per window makes the phase jitter and the ferrous/non-ferrous decision flicker. Locking the 8 kHz sampling to the 2 kHz drive (4× oversampling) is what makes the phase stable enough to threshold on.

## Results

A functioning detector that responds to metal and separates ferrous from non-ferrous targets by phase, with a live OLED readout and proximity tone. Full write-up in the [project report](https://github.com/Skab101/34621-Metal-Detector) (repo), with the KiCad hardware, LTspice/QSPICE validation, and MATLAB/Python analysis alongside the firmware.

## Tools & skills demonstrated

Real-time embedded DSP on an 8-bit MCU (single-bin DFT, coherent sampling, IIR filtering), induction-balance sensor design, power electronics (H-bridge coil driver), KiCad hardware, and SPICE validation — the electromagnetic-sensing and signal-processing core of course 34621, on real hardware.
