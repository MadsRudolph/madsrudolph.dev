---
title: 'Vinyl ADC: a discrete stereo converter'
summary: >-
  A stereo audio ADC built from op-amps and logic gates, with four milled PCBs visible through a printable organic lattice enclosure. Designed for 24-bit / 48 kHz output.
date: 2026-09-03
tags: ['Analog electronics', 'Delta-sigma ADC', 'SPICE', 'DSP', 'KiCad', 'PCB design', 'Raspberry Pi', '3D CAD', 'Audio']
repo: 'https://github.com/MadsRudolph/vinyl-adc'
featured: true
order: 1.2
status: in-progress
hero: '/media/vinyl-adc/showcase/orbit-poster.png'
heroAlt: 'Vinyl ADC in a rounded open lattice enclosure, with four visible circuit boards, solid connector mounts and an acrylic lid'
---

Personal project. I designed the converter, simulated its analog behavior, and split the circuit into four boards that can be milled in-house.

<figure data-gif-showcase>
  <img src="/media/vinyl-adc/showcase/orbit-poster.png" data-gif-src="/media/vinyl-adc/showcase/orbit.gif" data-poster-src="/media/vinyl-adc/showcase/orbit-poster.png" width="720" height="540" loading="lazy" alt="A full orbit around the printable organic lattice enclosure" />
  <button type="button" class="btn secondary" style="margin-top:0.75rem" data-gif-toggle aria-pressed="false">Play GIF</button>
  <figcaption>The 105 mm tall lattice enclosure, with a clear acrylic lid and reinforced connector islands. CAD render; physical print validation is pending.</figcaption>
</figure>

## The challenge

Comparator delay limited the sampling rate. A third-order loop and delay compensation reached about **68 dB SNR in simulation**. SPICE also caught a reversed charge pump that connectivity checks missed.

## Results

- **1.536 MHz** modulation; interleaved data sent to a Raspberry Pi over I2S.
- Simulation and netlist checks cover the four-board design.

**Current status:** Power and digital boards are in initial bench testing. The two channel boards still need decoupling capacitors; audio performance has not yet been measured on the finished hardware. The [assembly guide and bench log](https://vinyl-adc.madsrudolph.dev/) include graphical probe connections, actual readings and the remaining checks.

<figure data-gif-showcase>
  <img src="/media/vinyl-adc/showcase/electronics-poster.png" data-gif-src="/media/vinyl-adc/showcase/electronics.gif" data-poster-src="/media/vinyl-adc/showcase/electronics-poster.png" width="720" height="540" loading="lazy" alt="The four populated Vinyl ADC circuit boards" />
  <button type="button" class="btn secondary" style="margin-top:0.75rem" data-gif-toggle aria-pressed="false">Play GIF</button>
  <figcaption>Power, right channel, left channel, and digital interface, from bottom to top.</figcaption>
</figure>

## Printable enclosure

Rounded branches leave all four sides open so the boards remain visible. The enclosure is **144 × 144 × 105 mm**, adding 40 mm for the taller stack and cable routing. Solid mounting islands surround the connectors. Thicker corner ribs support the four M3 heat-set lid inserts, while the original acrylic lid pattern is retained.

The mesh is a single watertight part and has been sliced with organic supports. **Supports are required** for the branch overhangs and upper rim; a successful slice is not a physical strength or fit test. The print package includes STL and 3MF files, reference print settings and a small insert-fit coupon. Board spacing in the animation is illustrative.

[Download the enclosure and printing instructions](https://github.com/MadsRudolph/vinyl-adc/tree/main/enclosure) · [Download all three GIFs](https://github.com/MadsRudolph/vinyl-adc/tree/main/media/showcase)

<figure data-gif-showcase>
  <img src="/media/vinyl-adc/showcase/assembly-poster.png" data-gif-src="/media/vinyl-adc/showcase/assembly.gif" data-poster-src="/media/vinyl-adc/showcase/assembly-poster.png" width="720" height="540" loading="lazy" alt="The PCB stack and acrylic lid lift out of the lattice enclosure and reassemble" />
  <button type="button" class="btn secondary" style="margin-top:0.75rem" data-gif-toggle aria-pressed="false">Play GIF</button>
  <figcaption>The CAD assembly opens to show the PCB stack and lid.</figcaption>
</figure>

[Code, design files & full documentation →](https://github.com/MadsRudolph/vinyl-adc)
