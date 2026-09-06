---
title: 'AD3: a modular bench test rig'
summary: >-
  A CNC-friendly breakout for the Analog Discovery 3, with a plug-in analog and digital experiment board, printable enclosure, and Python commissioning scripts.
date: 2026-09-06
tags: ['KiCad', 'PCB design', 'Analog electronics', 'Filter design', 'SPICE', 'Measurement', 'Python', '3D CAD']
repo: 'https://github.com/MadsRudolph/ad3-test-rig'
featured: false
order: 1.3
status: in-progress
hero: '/media/ad3-test-rig/module-hero.webp'
heroAlt: 'Blender render of the AD3 test rig with its plug-in feature board and printed enclosure'
---

Personal project. This rig turns the Analog Discovery 3 flywire cable into a reusable bench interface for circuit experiments and board bring-up, including my [Vinyl ADC](/projects/vinyl-adc).

<figure>
  <img src="/media/ad3-test-rig/module-hero.webp" alt="Rendered assembly of the AD3 baseboard, stacked feature module and enclosure" width="1500" height="1100" />
  <figcaption>The plug-in configuration. These are design renders; physical assembly and fit checks are still pending.</figcaption>
</figure>

## From flywires to a test fixture

The 100 × 100 mm passive baseboard breaks out all 30 AD3 cable signals and adds selectable bench or instrument power connections. Its central space accepts a 170-point breadboard or a 70 × 90 mm plug-in module. Top sockets on the module keep every AD3 signal accessible.

The module adds a nominal 1.59 kHz low-pass filter, an 11:1 attenuator, selectable loopback paths, screw terminals, two buttons and two LEDs. Experiments connect through patch wires, so each circuit can be tested independently. Purchased PCB components are matched to my component-shop CSV.

<figure>
  <img loading="lazy" src="/media/ad3-test-rig/module-close.webp" alt="Close-up render of the module headers, analog components, terminals, buttons and LEDs" width="1500" height="1100" />
  <figcaption>The feature module replaces the breadboard during use. A printed support and taller storage cover accommodate the stack.</figcaption>
</figure>

## Designing for milling and assembly

Both boards use bottom-copper routing with 1.0 mm tracks, 0.85 mm global clearance and no vias. KiCad projects include local footprints, fabrication exports and assembly references. The enclosure is provided as editable Blender files and printable STLs.

A local dark-mode assembly guide connects reference designators to an interactive placement map, resistor colour codes and jumper settings. Python scripts use the WaveForms SDK to check analog gain and phase, then guide button and LED commissioning.

## What the checks caught

The module's four-leg tactile switches exposed a connectivity detail: each switch contains internally bonded pin pairs. A copper-only routing check reported gaps across those pairs. Modelling them explicitly in the KiCad footprints lets electrical checks account for the physical switch connections. The actual switch pin pairing still needs checking before assembly.

The underside male headers also need solder access. The assembly specifies a 1 mm gap below their plastic housings, with socket engagement and pin lengths to be confirmed against the actual parts.

## Results and current status

- **49 automated module checks pass**, covering inventory matching, connectivity, geometry, print meshes and simulated test failures.
- KiCad reports **zero ERC and DRC violations**, with no unconnected nets or schematic-to-board differences.
- SPICE responses agree with independent transfer-function calculations for the filter, attenuator and combined circuit.
- Commissioning scripts and wiring instructions are included; **physical electrical tests and first-print fit are not yet complete**.

<figure>
  <img loading="lazy" src="/media/ad3-test-rig/hero.webp" alt="Rendered original baseboard configuration with a 170-point breadboard and printed enclosure" width="1500" height="1100" />
  <figcaption>The original breadboard configuration remains available when the module is removed. Component bodies in the renders are illustrative.</figcaption>
</figure>

[Code, KiCad files, enclosure models & assembly instructions →](https://github.com/MadsRudolph/ad3-test-rig)
