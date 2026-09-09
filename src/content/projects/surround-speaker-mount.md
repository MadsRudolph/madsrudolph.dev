---
title: 'Surround speaker mount: compact pan and tilt'
summary: >-
  A three-part printable speaker wall mount with adjustable pan and tilt, parametric FreeCAD models, and an interactive Blender assembly.
date: 2026-09-09
tags: ['3D CAD', 'FreeCAD', 'Blender', '3D printing', 'Python', 'Audio']
repo: 'https://github.com/MadsRudolph/surround-speaker-mount'
featured: false
order: 1.4
status: in-progress
kind: personal
hero: '/media/surround-speaker-mount/assembly.webp'
heroAlt: 'Blender render of the wall plate, short swivel arm and padded speaker cradle'
---

Personal project. I designed a compact wall mount for surround speakers, with separate pan and tilt joints and a padded cradle that holds the cabinet without drilling into it. The same three printed parts serve either side of the room.

<figure>
  <img src="/media/surround-speaker-mount/assembly.webp" alt="Rendered speaker mount showing its wall plate, two pivot joints and four cradle clamp screws" width="1200" height="1000" />
  <figcaption>The compact second revision. This is a design render; printing and physical load testing are still pending.</figcaption>
</figure>

## How this will look

A living-room surround setup with the TV and front speakers ahead of the couch, and the two wall-mounted surrounds behind it. These Blender renders use the actual mount geometry and illustrative walnut speakers sized to the design's 150 × 150 × 180 mm cabinet envelope.

<figure>
  <a href="/media/surround-speaker-mount/living-room.webp"><img loading="lazy" src="/media/surround-speaker-mount/living-room.webp" alt="Blender living-room render with a TV, couch, front speakers and two surround speakers supported by wall mounts behind the seating" width="2000" height="1400" /></a>
  <figcaption>The proposed surround setup. Both wall mounts are shown with speakers installed and aimed toward the seating.</figcaption>
</figure>

<figure>
  <a href="/media/surround-speaker-mount/mount-in-use.webp"><img loading="lazy" src="/media/surround-speaker-mount/mount-in-use.webp" alt="Close-up Blender render of a walnut speaker held in the wall-mounted cradle, showing the pan and tilt joints, clamp screws and cable loop" width="1800" height="1500" /></a>
  <figcaption>The mount in use, with 28° pan and 12° downward tilt. The speakers and interior are illustrative; physical fit and load testing remain pending.</figcaption>
</figure>

[Explore the Blender scene and render script →](https://github.com/MadsRudolph/surround-speaker-mount/tree/main/showcase)

## Making room for the speaker and its cables

The default cabinet is **150 × 150 × 180 mm**, with a designed range of **±60° pan and 30° downward tilt**. A wall plate carries the vertical pan joint; a short connecting arm supports the horizontal tilt joint and cradle. Both use M5 bolts, while four M4 swivel-pressure screws retain the cabinet against padding.

FreeCAD generates the solid models from spreadsheet-linked parameters. Python scripts build the geometry, export STEP and print-oriented STL files, and check clearances. A separate Blender assembly provides renders and interactive posing. FreeCAD also has live mouse controls for aiming the assembly.

## What needed redesigning

The first version put the speaker too far from the wall. Shortening the pivot spacing from **100 to 55 mm** brought the cabinet's rear face from **197 to 147 mm** away from it. The connecting arm became shorter and wider, while the rear support was lowered to leave room for the terminal panel.

That reduction had a limit: the wide cradle still needs to clear the wall at full pan. The CAD checks sample **91 pan/tilt positions**, including a provisional terminal-and-plug envelope. Terminal-panel height and plug projection still need confirmation against the actual speaker.

Lowering the tilt pivot also changed the gravity lever arm. The load calculations were updated for the new geometry; a smaller mount alone does not establish better holding performance.

<figure>
  <img loading="lazy" src="/media/surround-speaker-mount/terminal-clearance.webp" alt="Rendered rear view of the speaker cabinet and mount showing the terminal area above the lowered rear support" width="1200" height="1000" />
  <figcaption>The rear terminal area stays above the support and tilt hardware. The cable-clearance dimensions are provisional.</figcaption>
</figure>

## Results and current status

- Three printable parts, with editable FreeCAD and Blender assemblies, STEP exports, a hardware list and print instructions.
- CAD checks report valid single solids; parameter checks exercise all six spreadsheet dimensions individually.
- Blender exports report one connected component and zero nonmanifold edges per part. All six STL exports were also re-imported into FreeCAD and checked as closed solids.
- Sampled clearance checks retain the intended motion range. They do not prove continuous clearance or account for flexible cables and deformation.

**Current status:** The CAD prototype is ready for first-print fit checks. Speaker mass, wall fixings and long-term joint holding performance remain unverified; no safe working load has been assigned.

The project combines parametric CAD, Python geometry automation, articulated assemblies and design for 3D printing.

[CAD files, validation reports & assembly instructions →](https://github.com/MadsRudolph/surround-speaker-mount)

[Download the three print-oriented STLs and print guide →](https://github.com/MadsRudolph/surround-speaker-mount/raw/refs/heads/main/speaker-mount-print-STLs.zip)
