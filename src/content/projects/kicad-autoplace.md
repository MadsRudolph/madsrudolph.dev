---
title: 'KiCad-Autoplace: connectivity-aware auto-placement & routing for KiCad'
summary: >-
  A desktop app that takes a prepared KiCad board — outline, locked parts,
  ground pours — and automatically places the remaining components and routes
  them with FreeRouting, handing back a finished, fab-ready .kicad_pcb. Built
  for the students at DTU Ballerup.
date: 2026-07-03
tags: ['Python', 'Electron', 'KiCad', 'PCB automation', 'FreeRouting', 'Desktop app']
repo: 'https://github.com/DTU-EKB/KiCad-Autoplace'
featured: false
order: 1.9
status: working
---

## What it is

**KiCad-Autoplace** is a desktop app that automates the tedious middle of PCB design: **component placement and routing**. You prepare a board in KiCad — draw the outline, lock any parts you care about, add your ground/power pours — and the app places everything else, routes it, and hands back a finished `.kicad_pcb`. It's built for the students at the **DTU Ballerup** electronics workshop, and it's the placement-and-routing half of the same fabrication workflow behind my [SRM-CAM mill tool](/projects/srm-cam) — where SRM-CAM turns a finished board into machine code, this one produces the finished board in the first place.

It's effectively a solo build (mine, with a CI bot filling in the rest).

## What it does

- **Multi-seed placement** — it doesn't gamble on one layout. It generates several placements and shows them as a gallery; you pick the one you like best.
- **Respects your constraints** — **locked** parts never move, and footprints you mark as connectors are auto-placed on the board edge.
- **Treats pours as planes** — it fills every copper pour on its own net, so the router sees GND/power as planes instead of trying to route them as traces.
- **Fabrication profiles** — pick CNC mill (0.85 mm) or fiber laser (0.8 mm) and the output's clearance and track rules match what that machine can actually make.
- **Route-driven refinement** — routes with FreeRouting, then re-anneals the congested spots; single- or double-sided.
- **Pre-run checklist** — flags a missing outline, ground net, or pours before you waste a run.

## How it's built

The engine core is **pure Python** with no KiCad dependency — placement, routing orchestration, and refinement — with a thin `kicad_io` / `routing` / `refine` layer bridging to KiCad's bundled `pcbnew` and to FreeRouting. On top of that sits an **Electron** desktop app (main / preload / renderer) as the primary interface, plus a `cli.py` headless runner exposing `place`, `place-multi`, `refine`, `finalize`, `preflight`, and `metrics`. Because the core is dependency-free, the unit tests run headless under any Python. The same engine also ships as a KiCad PCM plugin.

## The hard parts

- **Placement is an optimisation with bad local optima.** "Connectivity-aware" means placing parts so nets stay short and don't cross — and greedy placement gets stuck. Generating **multiple seeds** and surfacing them as a gallery is the pragmatic escape hatch: let the human pick the best of several good-enough layouts instead of chasing one perfect one.
- **The router has to see planes, not nets.** FreeRouting will happily route your ground net as a spider-web of traces unless you tell it not to. Filling each copper pour on its own net first is what makes the router treat GND/power as planes — a small preprocessing step that changes the entire character of the result.
- **Closing the loop between placement and routing.** A layout that looks clean can still route badly. Routing, measuring where it congested, and re-annealing those spots is what turns "placed" into "actually manufacturable."
- **Manufacturable on *our* machines.** The fabrication profiles exist because a board that routes fine at JLCPCB tolerances won't survive a 0.8 mm fiber-laser isolation cut — the clearance and track rules are tied to the real equipment in the lab.

## Results

A working desktop app that takes a prepared KiCad board to a placed, routed, fab-ready result — with multi-seed placement, FreeRouting integration, fab-specific rules, and a headless CLI and test suite underneath. It's in use by students at DTU Ballerup as a companion to the workshop's shared component library.

## Tools & skills demonstrated

A real desktop application (Electron front end over a pure-Python engine), PCB-domain automation (connectivity-aware placement, plane-aware routing, FreeRouting orchestration, DRC/fabrication rules), a headless CLI and unit-tested core, and KiCad `pcbnew` scripting — a substantial, self-directed tool that other people actually use.
