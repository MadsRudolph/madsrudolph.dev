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
hero: '/media/metal-detector/assembly-3d.png'
heroAlt: '3D CAD render of the assembled metal detector — control housing with PCB, shaft, and concentric coil head'
---

<figure>
  <img src="/media/metal-detector/assembly-3d.png" alt="3D CAD render of the assembled metal detector — control housing with PCB, shaft, and concentric coil head" width="1048" height="1223" />
  <figcaption>The full detector in CAD — control housing with the electronics, the shaft, and the concentric bucking-coil search head.</figcaption>
</figure>

## What it is

A working VLF (very-low-frequency) **induction-balance metal detector**, built for DTU's **34621 Electromagnetic Sensors & Digital Signal Processing** course. A transmitter coil is driven at 2 kHz; a receiver coil picks up the field re-radiated by nearby metal; and the firmware runs a **single-bin DFT** on the sampled receiver signal to recover its amplitude *and phase*. The phase is what matters — it's how the detector distinguishes ferrous from non-ferrous metal, not just "there's something there." Output goes to an OLED HUD and a variable-tone buzzer.

This was a four-person group project; I was the top contributor and worked across the DSP firmware, the coil/driver electronics, and the board.

## How it works

- **Transmitter:** an H-bridge (IRF5305 / IRL530) drives the TX coil with a 2 kHz square wave.
- **Coil head:** concentric TX/RX coils in a **bucking** configuration — a small opposing coil cancels the direct TX→RX coupling so the receiver sees (ideally) *only* the field from the target.
- **Acquisition:** the 10-bit ADC samples at 8 kHz — **4× oversampling** of the 2 kHz carrier, coherently locked to the drive so each DFT window lands on whole cycles.
- **DSP core:** a single-bin DFT (a Goertzel-style evaluation at just the carrier frequency) gives the in-phase and quadrature components, from which amplitude and phase are computed every window. An IIR smoother tames the noise before the phase is classified.
- **Feedback:** an SSD1306 OLED shows a live readout; a buzzer changes tone with proximity.

<figure>
  <img src="/media/metal-detector/block-diagram.png" alt="Block diagram of the metal detector signal chain from MCU drive through coils to DFT processing and UI" width="439" height="681" />
  <figcaption>The signal chain: MCU square-wave drive → H-bridge → TX coil, then RX coil → amplifier → ADC → DFT → filtering → OLED and buzzer.</figcaption>
</figure>

<figure>
  <img src="/media/metal-detector/dft-phasor.png" alt="Phasor plot of the single-bin DFT output showing amplitude and phase of the received signal" width="782" height="782" />
  <figcaption>The single-bin DFT gives the received signal as a phasor — amplitude and phase. The phase angle is what separates ferrous from non-ferrous metal.</figcaption>
</figure>

## The hard parts

The whole detector lives or dies on two things, and neither is in the textbook:

- **Nulling the bucking coil.** Induction balance only works if the direct TX→RX coupling is cancelled to near-zero, so the tiny target signal isn't buried under a huge carrier. Getting the concentric coils and the bucking winding physically balanced — and keeping them balanced — is fiddly, and any residual imbalance sets the noise floor for everything downstream.
- **A phase reading that doesn't wander.** Single-bin phase detection is only clean if the sampling is coherent with the drive; drift or a non-integer number of cycles per window makes the phase jitter and the ferrous/non-ferrous decision flicker. Locking the 8 kHz sampling to the 2 kHz drive (4× oversampling) is what makes the phase stable enough to threshold on.

<figure>
  <img src="/media/metal-detector/sampling.jpg" alt="Timing diagram showing ADC samples locked to the 2 kHz TX toggle for coherent 4x oversampling" width="2082" height="837" />
  <figcaption>Coherent sampling: the ADC samples (blue) are locked to the 2 kHz TX toggles (red) via the timer compare value, so every DFT window lands on whole carrier cycles.</figcaption>
</figure>

## Results

A functioning detector that responds to metal and separates ferrous from non-ferrous targets by phase, with a live OLED readout and proximity tone. The clearest evidence is on the bench — the received-coil signal barely moves over an empty coil, then shifts distinctly when metal enters the field:

<div class="fig-row">
  <figure>
    <img src="/media/metal-detector/rx-nometal.png" alt="Oscilloscope capture of the receiver signal with no metal present" width="1376" height="574" />
    <figcaption>RX signal — no metal.</figcaption>
  </figure>
  <figure>
    <img src="/media/metal-detector/rx-metal.png" alt="Oscilloscope capture of the receiver signal with metal present, showing a clear change" width="1320" height="571" />
    <figcaption>RX signal — metal present.</figcaption>
  </figure>
</div>

<figure>
  <img src="/media/metal-detector/pcb.png" alt="One of the project's custom KiCad PCBs" width="978" height="848" />
  <figcaption>One of the custom KiCad boards for the detector's analog front end.</figcaption>
</figure>

Full write-up in the [project report](https://github.com/Skab101/34621-Metal-Detector) (repo), with the KiCad hardware, LTspice/QSPICE validation, and MATLAB/Python analysis alongside the firmware.

## Tools & skills demonstrated

Real-time embedded DSP on an 8-bit MCU (single-bin DFT, coherent sampling, IIR filtering), induction-balance sensor design, power electronics (H-bridge coil driver), KiCad hardware, and SPICE validation — the electromagnetic-sensing and signal-processing core of course 34621, on real hardware.
