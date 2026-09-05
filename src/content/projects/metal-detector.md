---
title: 'VLF metal detector'
summary: >-
  A battery-powered metal detector that distinguishes ferrous and non-ferrous targets from the phase of the received signal.
date: 2026-04-15
tags: ['DSP', 'C / firmware', 'ATmega328P', 'KiCad', 'Analog electronics', 'Coursework']
repo: 'https://github.com/Skab101/34621-Metal-Detector'
featured: true
order: 1.75
status: working
kind: coursework
hero: '/media/metal-detector/hero-photo.jpg'
heroAlt: 'The finished metal detector held outdoors — yellow 3D-printed control housing with visible electronics, wooden shaft, and concentric coil head on frosty grass'
---

Four-person project for DTU 34621. The build combines an ATmega328P, custom analog electronics, an H-bridge transmitter, and a concentric coil head.

<figure>
  <img loading="lazy" src="/media/metal-detector/hero-photo.jpg" alt="The finished metal detector held outdoors — yellow 3D-printed control housing with visible electronics, wooden shaft, and concentric coil head on frosty grass" width="1600" height="755" />
  <figcaption>The detector assembled for field use.</figcaption>
</figure>

## The challenge

The weak receive signal had to be measured consistently against the transmitter. Coherent sampling and a single-bin DFT extract amplitude and phase in real time.

## Results

- Metal detection with an OLED readout and proximity tone.
- **164 minutes** of continuous operation recorded in a bench test.
- Custom PCBs and a printed control housing.

<figure>
  <img loading="lazy" src="/media/metal-detector/battery-discharge.jpg" alt="Battery discharge test plot showing pack voltage falling gently from 8.88 V to 7.76 V over 164 minutes, well above the 6.0 V threshold" width="1400" height="871" />
  <figcaption>Battery voltage during the 164-minute bench test.</figcaption>
</figure>

[Code, design files & full documentation →](https://github.com/Skab101/34621-Metal-Detector)
