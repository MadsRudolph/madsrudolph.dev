---
title: 'A 16-bit processor in VHDL'
summary: >-
  A microcoded processor built and tested on a Nexys 4 DDR FPGA, from the ALU through memory and display output.
date: 2026-05-17
tags: ['VHDL', 'FPGA', 'Vivado', 'Digital design', 'Computer architecture', 'Coursework']
repo: 'https://github.com/Skab101/Design-of-digital-systems-62711'
featured: false
order: 11
status: working
kind: coursework
---

Four-person project for DTU 62711. The system combines a custom datapath, microprogrammed controller, RAM, and a seven-segment interface.

<figure>
  <img loading="lazy" src="/media/digital-systems-62711/timing.png" alt="Simulation timing diagram of the port register write path" width="1760" height="1303" />
  <figcaption>Simulation timing used to inspect the port-register write path.</figcaption>
</figure>

## The challenge

A display write used the upper byte after an upstream block had forced it to zero. Tracing that path exposed why two digits could never change. Hardware and assembler opcodes also needed to agree.

## Results

- Programs run in simulation and on the FPGA.
- Around **27 VHDL testbenches** across the project phases.
- Custom Python assembler and a combined project report.

[Code, design files & full documentation →](https://github.com/Skab101/Design-of-digital-systems-62711)
