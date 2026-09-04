---
title: 'SRM-CAM: a CAM tool for milling PCBs on a Roland SRM-20'
summary: >-
  A desktop CAM application that turns KiCad Gerbers into machine code for a
  Roland SRM-20 mill — auto bed-leveling, double-sided registration, several
  boards per sheet, a reverse-engineered SPI machine link, and a run-plan
  interface built around the way the lab actually works. Windows installer and
  Linux AppImage, used daily at the DTU Ballerup fab lab.
date: 2026-09-03
tags: ['Python', 'PySide6', 'CNC / grbl', 'Arduino', 'SPI', 'Reverse engineering', 'Computational geometry', 'KiCad', 'Desktop app']
repo: 'https://github.com/MadsRudolph/srm-cam'
featured: true
flagship: true
order: 1
status: working
hero: '/media/srm-cam/gui2-traces.png'
heroAlt: 'SRM-CAM v0.5 — the run plan down the left rail, the machine bed with a board and its isolation toolpaths in the middle, and the selected step’s parameters on the right'
---

<figure>
  <img src="/media/srm-cam/gui2-traces.png" alt="SRM-CAM v0.5 — the run plan down the left rail, the machine bed with a board and its isolation toolpaths in the middle, and the selected step’s parameters on the right" width="1600" height="1029" />
  <figcaption>SRM-CAM 0.5. The left rail is the run plan — every operation in the order the machine will do it. The stage draws the bed at true size with the board where it will be cut; the inspector on the right belongs to whichever step is selected. The red banner is a finding that will not go away until the board stops being wrong.</figcaption>
</figure>

## What it is

The Roland SRM-20 is a small desktop CNC mill that can isolation-route PCBs — cut the copper away from around the traces instead of etching it. The stock toolchain for that is slow web tools (mods.io) or fragile wrappers around FlatCAM. **SRM-CAM is my replacement: one Python package with a GUI and a CLI that takes KiCad Gerber + Excellon files and produces the machine code the SRM-20 actually runs.** It previews the cut in 3D, probes and compensates for a warped board, registers double-sided boards after the flip, panels several boards onto one sheet of copper, and re-cuts individual failed spots without regenerating the whole job.

It drives the CNC half of my [dorm-room PCB fabrication line](/about), it is the tool the DTU Ballerup fab lab teaches with, and it milled every board in my [Vinyl ADC](/projects/vinyl-adc). It ships as a Windows installer and a Linux AppImage, both built from scratch in CI on every tagged release, with a [user guide](https://madsrudolph.github.io/srm-cam/) that wears the app's own theme. It is also the project I have poured the most hours into — a lot of them late nights, some of them between classes. If you only read one page on this site, I'd want it to be this one.

## Problem / motivation

Milling a PCB sounds like a solved problem until you try it. A board is never perfectly flat — a 130 µm bow over 50 mm is normal — and an isolation cut only 0.1 mm deep will skip copper in the low spots and gouge the substrate in the high spots. Double-sided boards need the two faces to line up to under 0.1 mm after you flip the stock. The SRM-20 deliberately hides the machine state behind a proprietary control panel. And the people using it are first-year students who have never seen a CNC before, on a machine that will happily drive a spinning bit into a screw head. I wanted a tool that treated all of that as first-class problems instead of hoping the board was flat and the operator was lucky.

## Architecture / approach

The package (`gerber2rml`) is an engine with no GUI dependencies, and a PySide6 front-end on top:

- **Parsing** — Gerber traces and Excellon drills into an internal geometry model.
- **Toolpath engine** — isolation offset, drill, board cut-out and panel paths; ramped lead-in; Liang–Barsky segment clipping for region rework.
- **Registration** — dowel-pin or fiducial-based two-sided alignment (closed-form 2D Umeyama similarity fit), with the top-side files re-written to where the board actually landed after the flip.
- **Leveling** — a probed height map per face (plane fit for tilt, bilinear for bow) that warps every cut's Z in machine coordinates.
- **Checks** — a preflight pass that says, before anything is written, whether the board fits the bed, whether the bit can reach the depth, which nets sit closer than the cutter can separate, and whether the job runs off the copper.
- **Backends** — G-code (`.nc`, recommended) or Roland's RML-1 (`.rml`).
- **Hardware** — an Arduino Uno running a custom SPI sketch that talks to the SRM-20's official remote header: the DRO, jogging, probing, and an emergency STOP that reaches a running move.
- **Packaging** — one PyInstaller spec that freezes both platforms; a Windows installer and a Linux AppImage from the same tag; a `platform.py` that is the only place allowed to know which OS it is on, enforced by a test.

The engine is heavily tested: **just over a thousand test functions across 86 files, about 14k lines of test against 33k lines of code**, with GUI tests running headless via `QT_QPA_PLATFORM=offscreen` on both a Windows and a Linux runner. A golden test asserts a fixed board still produces byte-identical `.nc` output, so a dependency upgrade cannot quietly change what gets cut, and a monthly canary job runs the suite against the newest Python and dependencies so the world moving goes red before anyone is mid-course.

### The interface is the run plan

<figure>
  <img src="/media/srm-cam/gui2-runsheet.png" alt="SRM-CAM after an export: the run plan typeset on the stage as a document — origin instructions, then each numbered step with its file name, tool and time" width="1600" height="1029" />
  <figcaption>After an export the stage becomes the run sheet — the same numbered plan, typeset as a document with the file for each step, ready to copy into a lab logbook. The success state of an export is not "wrote six files"; it is knowing what to do with them.</figcaption>
</figure>

Version 0.5 replaced the whole front-end. The first interface (still shipped, as `--original`) had grown to an 11k-line settings form with four different controls that selected the current operation, two of them nested tab bars with identical labels that could disagree with each other, and 26 error dialogs whose entire body was `str(e)`. The redesign started from one idea: a machine shop hangs a **traveller** beside the job — a numbered sheet of operations, the tool each needs, a box to tick. The engine already wrote one as a text file nobody read. In the new interface that plan *is* the interface: the left rail is the traveller, clicking a row is how you select an operation, and the stage, the inspector and the printed sheet are all renderings of one list. A test exports the demo board through the real engine and asserts the plan's steps are exactly the toolpath files the engine wrote, in that order — add an operation to the engine and forget the rail, and the build fails.

<figure>
  <img src="/media/srm-cam/gui2-checks.png" alt="SRM-CAM's check step: findings listed beside the board — fits the bed, Z reach unknown, holes fit the bit, 13 nets closer than the bit, job runs off the copper" width="1600" height="1029" />
  <figcaption>The checks live beside the board you are fixing, not in a message box that takes the findings with it when you dismiss it. Each one says what it costs you if you cut anyway, and what to do about it.</figcaption>
</figure>

### Several boards on one sheet

<figure>
  <img src="/media/srm-cam/gui2-panel-cutout.png" alt="Two copies of a board placed side by side on one sheet of copper, sharing a single cut line where they touch; a warning says the job overhangs the reachable copper by 4.8 mm" width="1600" height="1029" />
  <figcaption>Panels: two or more designs on one piece of copper, cut as one job — one trace file, one drill file, one cut-out. Boards that touch share a single cut, and nothing is cut along the sheet's outer edge. Here the job is 4.8 mm too wide for the copper, and the stage says so before a file is written.</figcaption>
</figure>

## What went wrong and how it was diagnosed

This is where the project actually lives. A selection, in roughly the order they were found:

**Dowel holes came out 0.4 mm undersize.** Double-sided boards wouldn't re-register after the flip — the alignment pins physically wouldn't seat. Measured holes were ~2.7 mm where 3.1 mm was commanded. The cause is that the SRM-20's internal compensation undershoots on interpolated (circular) cuts. I dialed in per-pin clearance compensation empirically with a *swept fit-test coupon* — one drill job with holes stepped across a range of diameters, cut once, pick the snug one by hand — landing on +0.20 mm for the 3.1 mm pins and +0.15 mm for the 1.9 mm pins. The offsets are non-linear, which is why each pin size needed its own. Registered boards then held to under 0.1 mm.

**"Leveling" made the middle of the board worse.** After probing a board with the first-generation 3-point routine, center traces cut shallow and corners cut deep. A test board measured 130 µm of bow. The bug was that three points can only ever fit a *plane* — the routine was correcting tilt while assuming the board was flat, when the real error was curvature. Fixed by probing a full grid and doing bilinear interpolation, plus a two-phase probe: a fast coarse raster at 25 µm steps, then a fine re-probe of only the last ~1 mm at the machine's native 10 µm resolution. Double-sided boards now get a map per face, because a board that was bowed one way before the flip is bowed the other way after it.

<figure>
  <img src="/media/srm-cam/gui2-level.png" alt="SRM-CAM bed-leveling view: the probed height map drawn as a coloured surface over the board, with the probe grid and the measured Z at each point" width="1600" height="1029" />
  <figcaption>The probed surface drawn where it was measured, on the face it belongs to. Every Z in the cut is corrected to the real board, not an assumed flat plane.</figcaption>
</figure>

**Endmills snapped on first contact with copper.** The SRM-20 has no `S` word — spindle RPM is a front-panel slider, and `M3` starts the spindle *concurrently* with motion rather than waiting for it to spin up. So the bit was hitting copper mid-acceleration. Two independent fixes: a `G04 X2.` dwell emitted after every `M3` so the spindle reaches full speed before any motion, and a ramped lead-in that descends to full depth over the first ~1 mm of the cut path instead of plunging vertically. The G-code parser had to learn to skip `G04` lines so the simulator didn't read the dwell's `X2.` as an X coordinate.

**V-bit traces came out wildly inconsistent.** Engraving 0.2 mm SMD traces with a V-bit on an unleveled bed gave visibly uneven widths. The geometry explains it: for a V-bit, `width = tip + 2·depth·tan(θ/2)`, so a 25 µm height error becomes a 13–50 µm width error. I flipped the tool model from depth-first to *width-first* (operator sets target width, depth is back-solved) and made the preflight check **refuse to run a V-bit job without bed leveling enabled**, because on a V-bit the leveling isn't optional.

**The firmware read one bit of the machine's status word.** An audit of Roland's SPI library in August found the project was calling 5 of its 17 commands, and reading a single `moving` bit out of the status word. Roland's own example decodes the whole thing. The unread bits include *paused*, *cover open*, *error* and *command rejected* — so the probe routine could not tell "move finished" from "machine paused" and inferred a pause from an 8-second timeout, which is exactly the near-miss in the June log where a paused machine kept queueing deeper Z moves, and a rejected move was acknowledged as if it had run. The v3 firmware decodes the full word, adds `stopMoving` so STOP drops a move in flight instead of waiting for it to finish, and exposes `turnSpindle` — the one command that removes the last hard dependency on Roland's VPanel software for a wet run.

**The exported files changed with which row was lit.** Found in a read-only review of the new interface before shipping it: the export read the height map and the flex margin off the *selected step's* face, so clicking a different row in the rail and exporting again produced different files. Same review, same class of bug: applying the flat-endmill preset after the V-bit one kept `tool_type="vbit"`, which would have commanded a 0.2 mm isolation cut with a 0.8 mm bit; the bed-fit check tested the plain board instead of the placed layout, so a dowel 6 mm off the bed passed; and the Z-reach check could never fire because no probed surface was ever passed to it. Forty-odd defects in that review, each now pinned by a test.

**Every 3D view was blank on Linux.** The first real run on Fedora: both interfaces opened, every 3D window died — the bed visualiser and both toolpath simulators. pyqtgraph refuses an OpenGL context below 2.1, and it checks the version that was *requested*, not what the driver can do; Qt's default request on Linux is 2.0, so an NVIDIA card reporting OpenGL 4.6 was rejected out of hand. It did not fail where you would look: the refusal surfaces as a `SystemError` from whatever event filter happens to be running, and under the offscreen platform used in CI there is no traceback at all — the process simply stops and the suite hangs, which it did for two hours with no output. The fix is one module that configures the surface format before the application exists, called by both interfaces, plus a test that builds the 3D window and fails instead of skipping. Linux also got its own dependency lock, frozen on a real Linux runner, because a lock resolved from Windows evaluates pip's environment markers against the host: it leaked `pywin32` into the Linux set and picked a PySide6 that matched nothing.

## Results

- Full KiCad-to-milled-board pipeline working: traces, drills, cut-out, double-sided, panels of several boards.
- Double-sided registration holding to **<0.1 mm** after flip (dowel and fiducial methods).
- Bed leveling handles real board bow (validated against a 130 µm bowed board), one map per face.
- Grid probe of a typical board completes in ~5 minutes.
- **v0.5.0**, 374 commits, ~1,000 tests green on Windows and Linux; Windows installer and Linux AppImage built from a clean runner on every tag.
- A KiCad plugin that draws the mill's build area in the PCB editor and says whether the board fits — with one shared definition of the machine, asserted equal on both sides by the test suite, so KiCad can't say a board fits while SRM-CAM refuses to cut it.
- Novice / Professional modes: the same settings export byte-identical files in either, so a student's board and a teacher's board come out the same. A site preset file lets a course hand approved feeds and depths to every seat.
- A maintenance document written for whoever owns this after I graduate: the honest risk table, the runbook for when CI goes red, and how to rebuild the installer with no GitHub at all.

<figure>
  <div class="img-pair">
    <img src="/media/srm-cam/board-front.jpg" alt="Milled double-sided PCB, front copper, held to the light" width="2132" height="2740" />
    <img src="/media/srm-cam/board-back.jpg" alt="Milled double-sided PCB, back copper, held to the light" width="2132" height="2740" />
  </div>
  <figcaption>A finished double-sided board off the SRM-20 — front and back copper, held to the light. The two faces register to under 0.1 mm after the flip.</figcaption>
</figure>

## Tools & skills demonstrated

Reverse-engineering an undocumented machine interface (SPI over the SRM-20 remote header, including auditing the vendor library for what it never used), computational geometry (segment clipping, similarity-transform fitting, height-map interpolation, shared-edge panel cut-outs), G-code/RML generation, Arduino firmware, a PySide6 desktop app with an embedded 3D view designed around how a machine shop actually works, cross-platform packaging with reproducible builds, and disciplined testing on a hard-to-test codebase.
