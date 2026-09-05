---
title: 'Sub crossover: a measured analog filter'
summary: >-
  A custom analog crossover for a Bose bass module, designed from measurements and built on a milled PCB.
date: 2026-08-17
tags: ['Analog electronics', 'Audio', 'Filter design', 'Op-amp (TL072)', 'Measurement', 'KiCad', 'PCB design', '3D CAD']
repo: 'https://github.com/MadsRudolph/personal-projects'
featured: true
order: 1.3
status: in-progress
hero: '/media/subxo/card.jpg'
heroAlt: 'The finished crossover: black printed box with a clear acrylic lid, two knobs and a toggle on the front, a 3.5 mm lead plugged in'
---

Personal project. I measured the bass module, designed a TL074 filter with three selectable corners, and built the board and enclosure.

<figure>
  <video data-showcase controls preload="metadata" src="/media/subxo/assembly.mp4" poster="/media/subxo/assembly-poster.jpg" width="1280" height="720" loop muted playsinline></video>
  <figcaption>The crossover enclosure and board in an exploded CAD view.</figcaption>
</figure>

## The challenge

The module’s existing bandpass ruled out the original crossover plan. Bench testing also caught a missing bias path and, later, a fault between the level pot and output jack.

## Results

- Measured corners: **94.9, 136.9, and 179.0 Hz**, within **0.2 dB** of the model.
- Filter-stage noise: **58 µV rms**, instrument-limited.

**Current status:** Filter and polarity stages verified. The output-jack fault and in-room acoustic measurements are still outstanding.

<figure>
  <img loading="lazy" src="/media/subxo/gate5-bode.png" alt="Bode plot of the crossover board: three measured low-pass curves at 95, 137 and 179 Hz sitting on the as-built model, with the 20–120 Hz band the bass module plays shaded" width="1600" height="1209" />
  <figcaption>Measured filter responses against the as-built model.</figcaption>
</figure>

[Code, design files & full documentation →](https://github.com/MadsRudolph/personal-projects)
