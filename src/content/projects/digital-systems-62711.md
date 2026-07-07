---
title: 'A soft microprocessor in VHDL (DTU 62711)'
summary: >-
  A working 16-bit soft microprocessor built up over three phases on a Nexys 4
  DDR FPGA — ALU and datapath, a microprogrammed controller, then the full
  system with RAM, a port register, and a seven-segment driver, running assembled
  microcode programs on real hardware.
date: 2026-05-17
tags: ['VHDL', 'FPGA', 'Vivado', 'Digital design', 'Computer architecture', 'Coursework']
repo: 'https://github.com/Skab101/Design-of-digital-systems-62711'
featured: false
order: 11
status: working
---

## What it is

A complete **16-bit soft processor**, designed in VHDL and run on a Nexys 4 DDR (Artix-7) FPGA, for DTU's **62711 Design of Digital Systems**. The course builds the CPU up over three project phases:

- **PWA — ALU & datapath:** register file, function unit, shifter, and the datapath MUXes.
- **PWB — microprogram controller:** program counter, instruction register, sign extender, zero filler, and the instruction-decoder/controller (a microcoded state machine).
- **PWF — the full microprocessor:** PWA + PWB combined with a 256×16 block RAM, an 8×8 port register, the data-bus MUX, and a seven-segment driver into one top-level system, running microcode programs (assembled with the group's `dsdasm` tool) both in GHDL/Vivado simulation and on the board.

A four-person group project, verified with ~27 VHDL testbenches across the phases and documented in a 67-page combined report.

## What went wrong and how it was diagnosed

The interesting failures were all in the seams between blocks:

**The left two seven-segment digits could never show a non-zero value.** A store to the high port-register address (`0xF9` → MR1) always wrote `0x00`, no matter the data. The cause was a data-bus mismatch: the `PortReg8x8` block latches MR1 from `Data_In(15 downto 8)`, but the `Zero_Filler_2` upstream always pads those upper bits to zero. So the byte destined for MR1 was zeroed before it ever arrived — the two left digits were structurally stuck at `00`. The one-line fix is to source MR1 from `Data_In(7 downto 0)` like the other registers. It was the kind of bug that only shows up once you write a program that actually tries to display data there.

<figure>
  <img src="/media/digital-systems-62711/timing.png" alt="Simulation timing diagram of the port register write path" width="1760" height="1303" />
  <figcaption>Port-register write timing in simulation — the kind of waveform trace used to pin down where the byte bound for MR1 was getting zeroed.</figcaption>
</figure>

**AND and OR were swapped versus the textbook.** Our hardware decoded `OR = 0001000` and `AND = 0001001`; the course textbook (and the reference Java assembler) use the opposite. Assemble a program with the wrong tool and every AND/OR silently does the other operation. The fix was to standardise on our own Python assembler (`dsdasm`), whose opcodes match the hardware, and to document the discrepancy so nobody reached for the Java tool by mistake.

**Branch-on-zero tests the wrong thing if you assume.** `BRZ` branches on the zero flag of `R[SA]` — the register named in the branch instruction's own source slot, evaluated combinationally through the ALU — not on "the result of the previous instruction." Getting that wrong makes conditional loops branch on stale state. Writing it down as "put the value you want tested in BRZ's source slot" saved a lot of confused single-stepping.

## Results

A soft CPU that fetches, decodes, and executes its instruction set on the Nexys 4 DDR, runs assembled microcode (e.g. a plus/minus calculator) in simulation and on hardware, and is backed by a full testbench suite and a 67-page report.

## Tools & skills demonstrated

VHDL design and simulation (Vivado + GHDL), computer architecture from the gates up (ALU, datapath, microprogrammed control, memory subsystem), a custom Python microcode assembler, and the discipline of testbench-driven bring-up on real FPGA hardware.
