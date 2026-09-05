---
title: 'KiCad-Autoplace: automated PCB layout'
summary: >-
  A desktop tool that places and routes prepared KiCad boards, built for the DTU Ballerup workshop and used to fabricate real PCBs.
date: 2026-07-03
tags: ['Python', 'Electron', 'KiCad', 'PCB automation', 'FreeRouting', 'Simulated annealing', 'Desktop app']
repo: 'https://github.com/DTU-EKB/KiCad-Autoplace'
featured: true
order: 1.9
status: working
hero: '/media/kicad-autoplace/gui.jpg'
heroAlt: 'The AutoPlace desktop app — sidebar with strategy/fabrication/routing settings, a green pre-run check, and a board canvas of 131 colour-coded footprints before placement'
---

Personal project. I built a workflow that scores placement candidates, refines the best layout, and sends it to FreeRouting.

<figure>
  <img loading="lazy" src="/media/kicad-autoplace/gui.jpg" alt="The AutoPlace desktop app — sidebar with strategy/fabrication/routing settings, a green pre-run check, and a board canvas of 131 colour-coded footprints before placement" width="1600" height="841" />
  <figcaption>Placement settings and the board canvas.</figcaption>
</figure>

## The challenge

Apparently poor routing results came from the test setup: unconnected ground pours inflated the unrouted count. Fixing the harness brought the same small boards to **100% routed**.

## Results

- One 131-component example reduced wirelength by **33.6%** and crossings from **427 to 164**.
- Sorting net accumulation made seeded placement reproducible across processes.
- Outputs verified by milling real boards.

<figure>
  <div class="board-photos">
    <img loading="lazy" src="/media/kicad-autoplace/board-front.png" alt="The bare CNC-milled board, front copper" width="417" height="598" />
    <img loading="lazy" src="/media/kicad-autoplace/board-back.png" alt="The bare CNC-milled board, back copper" width="426" height="586" />
  </div>
  <figcaption>A board fabricated from the generated layout.</figcaption>
</figure>

[Code, design files & full documentation →](https://github.com/DTU-EKB/KiCad-Autoplace)
