---
title: 'Vinyl ADC: a discrete stereo converter'
summary: >-
  A stereo audio ADC built from op-amps and logic gates, with four milled PCBs in a custom enclosure. Designed for 24-bit / 48 kHz output.
date: 2026-09-03
tags: ['Analog electronics', 'Delta-sigma ADC', 'SPICE', 'DSP', 'KiCad', 'PCB design', 'Raspberry Pi', '3D CAD', 'Audio']
repo: 'https://github.com/MadsRudolph/vinyl-adc'
featured: true
order: 1.2
status: in-progress
hero: '/media/vinyl-adc/showcase/orbit-poster.png'
heroAlt: 'Blender render of the assembled Vinyl ADC enclosure, with a clear acrylic lid, front gain control, and side RCA connectors'
---

Personal project. I designed the converter, simulated its analog behavior, and split the circuit into four boards that can be milled in-house.

<figure>
  <video data-showcase src="/media/vinyl-adc/showcase/orbit.mp4" poster="/media/vinyl-adc/showcase/orbit-poster.png" width="960" height="720" controls loop muted playsinline preload="metadata" aria-label="Full orbit around the assembled Vinyl ADC enclosure"></video>
  <figcaption>The assembled enclosure design.</figcaption>
</figure>

## The challenge

Comparator delay limited the sampling rate. A third-order loop and delay compensation reached about **68 dB SNR in simulation**. SPICE also caught a reversed charge pump that connectivity checks missed.

## Results

- **1.536 MHz** modulation; interleaved data sent to a Raspberry Pi over I2S.
- Simulation and netlist checks cover the four-board design.

**Current status:** Boards are being milled and brought up. Audio performance has not yet been measured on the finished hardware.

<figure>
  <video data-showcase src="/media/vinyl-adc/showcase/electronics.mp4" poster="/media/vinyl-adc/showcase/electronics-poster.png" width="960" height="720" controls loop muted playsinline preload="metadata" aria-label="A close-up of the four populated Vinyl ADC circuit boards"></video>
  <figcaption>Power, right channel, left channel, and digital interface, from bottom to top.</figcaption>
</figure>

<figure>
  <video data-showcase src="/media/vinyl-adc/showcase/assembly.mp4" poster="/media/vinyl-adc/showcase/assembly-poster.png" width="960" height="720" controls loop muted playsinline preload="metadata" aria-label="The Vinyl ADC PCB stack and lid lift out of the enclosure and reassemble"></video>
  <figcaption>The CAD assembly opens to show the PCB stack and lid.</figcaption>
</figure>

[Code, design files & full documentation →](https://github.com/MadsRudolph/vinyl-adc)
