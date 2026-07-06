---
title: 'Analog IC design: a two-user Cadence opamp workflow'
summary: >-
  Op-amp schematic design and transistor characterization on a 180 nm CMOS
  process in Cadence Virtuoso, run on DTU's HPC cluster with a Git-synchronized
  two-person workflow and SKILL/Python automation.
date: 2026-04-07
tags: ['Cadence Virtuoso', 'Analog IC design', 'SKILL', 'Spectre', 'Python', 'Git workflow', '180 nm CMOS']
order: 7
status: archived
hero: ''
heroAlt: 'Op-amp schematic in Cadence Virtuoso'
---

<!-- NOTE: this project intentionally has no public repo link. See the confidentiality note below. -->
<!-- PHOTO NEEDED: a screenshot of an op-amp schematic or a DC-sweep characterization plot from Virtuoso — but only if it contains no foundry-confidential PDK detail. When in doubt, use a hand-drawn block diagram instead. -->
<div class="media-placeholder">FIGURE: op-amp schematic or DC-sweep plot (confidentiality-checked)</div>

## What it is

Analog integrated-circuit design coursework taken past the point of just getting it done: designing an operational amplifier and its bias cells on a **180 nm CMOS process** in **Cadence Virtuoso**, running the tools on DTU's `alba` HPC cluster, and characterizing the transistors from Spectre simulations. What makes it worth writing up is the *engineering-practice* layer — a **Git-synchronized two-user workflow** and a set of SKILL and Python automation scripts.

## Problem / motivation

Cadence projects are notoriously hard to collaborate on: the design database is binary, tool state is spread across generated files, and everything is pinned to absolute paths on a shared cluster filesystem. My design partner and I wanted to actually work in parallel — each on our own transistor characterization, merging cleanly — rather than passing a single library back and forth and hoping nothing broke.

## Architecture / approach

- **The design.** An `opamp_core` plus bias cells, with a DC characterization testbench. Transistor characterization swept NMOS and PMOS devices across W/L geometries and gate voltages.
- **Collaboration.** Both users worked from shared design libraries on the cluster's NFS, synchronized through Git. My partner developed the PMOS characterization on a separate branch, merged back via a pull request.
- **Automation.** SKILL scripts (Cadence's Lisp dialect) regenerated the testbench schematic after design changes and fixed connectivity programmatically; a Python script parsed Spectre DC-sweep PSF output to compute Shichman–Hodges parameters (µ·Cox, threshold voltage, transconductance).

## What went wrong and how it was diagnosed

**Absolute paths broke cross-user regeneration.** The design libraries referenced each other by absolute path, so when the second user tried to regenerate or simulate from the same library state on the shared filesystem, the references pointed into the wrong home directory and the build fell apart. The fix was to merge the libraries in `cds.lib` using **relative paths**, after which either of us could regenerate the design from a common state — the single change that made the two-person workflow actually work.

**The opamp's input pair was wired backwards.** The testbench misbehaved because the input-pair pins in the core cell were labelled with inverted polarity, so the feedback came out positive. I diagnosed it down to the pin labels and rebuilt the testbench with a SKILL script (`create_tb_v3.il`) rather than clicking through the fix by hand — repeatable, and documented in the script itself. A related pass corrected floating substrate/bulk connections that were left unconnected.

## Results

- A working op-amp design and testbench on a 180 nm CMOS process, with NMOS/PMOS parameters extracted from simulation via automated PSF parsing.
- A genuinely collaborative Cadence workflow — relative-path libraries, branch-and-merge over Git, two users regenerating from shared state — which is unusual to get working at all in this toolchain.

## Confidentiality note

**This project has no public repository link, by design.** The work depends on a foundry PDK (X-FAB XT018) that is NDA-protected and available to me only under DTU's institutional license, and the Cadence design database is binary and can't be selectively redacted. So this page describes the *methodology and the engineering practices* — the collaboration workflow, the automation, the debugging — and deliberately omits schematics and any foundry-supplied detail. Happy to talk through it in more depth in an interview setting.

<!-- VERIFY with Mads: confirm you're comfortable describing even this much publicly given course/DTU policy, and that no figure added later exposes PDK-confidential material. If in any doubt, this page can be unlisted or cut entirely. -->

## Tools & skills demonstrated

Analog IC design in Cadence Virtuoso, Spectre simulation and transistor parameter extraction, SKILL and Python automation of an EDA flow, and — the part most engineers never see in a student — making a real collaborative version-controlled workflow function inside a toolchain that fights it.
