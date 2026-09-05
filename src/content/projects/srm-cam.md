---
title: 'SRM-CAM: PCB milling software'
summary: >-
  My CAM application turns KiCad boards into milling jobs for the Roland SRM-20. Used daily at the DTU Ballerup fab lab.
date: 2026-09-03
tags: ['Python', 'PySide6', 'CNC / grbl', 'Arduino', 'SPI', 'Reverse engineering', 'Computational geometry', 'KiCad', 'Desktop app']
repo: 'https://github.com/MadsRudolph/srm-cam'
featured: true
flagship: true
order: 1
status: working
hero: '/media/srm-cam/board-front.jpg'
heroAlt: 'A double-sided PCB milled on the SRM-20, held to the light'
---

Personal project. I built the CAM software and reverse-engineered the mill’s SPI interface, covering probing, double-sided registration, and machine control.

<figure>
  <img loading="lazy" src="/media/srm-cam/gui2-traces.png" alt="SRM-CAM v0.5 — the run plan down the left rail, the machine bed with a board and its isolation toolpaths in the middle, and the selected step’s parameters on the right" width="1600" height="1029" />
  <figcaption>The milling interface: board preview and ordered run plan.</figcaption>
</figure>

## The challenge

A bowed PCB left isolation cuts unfinished. I replaced three-point leveling with a probed grid that follows the actual copper surface.

## Results

- Double-sided registration below **0.1 mm** after flipping the board.
- Complete trace, drill, and cut-out jobs, including multiple boards per panel.
- Windows and Linux releases, with automated tests and builds.

<figure>
  <div class="img-pair">
    <img loading="lazy" src="/media/srm-cam/board-front.jpg" alt="Milled double-sided PCB, front copper, held to the light" width="2132" height="2740" />
    <img loading="lazy" src="/media/srm-cam/board-back.jpg" alt="Milled double-sided PCB, back copper, held to the light" width="2132" height="2740" />
  </div>
  <figcaption>A double-sided board milled with SRM-CAM.</figcaption>
</figure>

[Code, design files & full documentation →](https://github.com/MadsRudolph/srm-cam)
