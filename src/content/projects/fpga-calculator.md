---
title: 'FPGA calculator in VHDL (Basys 2)'
summary: >-
  A programmable two-stage calculator implemented in VHDL on a Basys 2 FPGA:
  three 8-bit inputs and two operators drive an FSM through add, subtract,
  multiply, and a custom sequential-division component, with results on the
  seven-segment display.
date: 2026-04-15
tags: ['VHDL', 'FPGA', 'Digital design', 'FSM', 'Coursework']
repo: 'https://github.com/Skab101/FPGA_Calculator'
featured: false
order: 13
status: working
kind: coursework
---

## What it is

A **programmable calculator** built in VHDL on a Digilent **Basys 2** FPGA, as the final assignment for DTU's **30081 Digitalteknik**. It evaluates two-stage expressions of the form:

> `RESULT = (InputA  Op1  InputB)  Op2  InputC`

where the three 8-bit operands and the two operators are entered on switches and buttons, and the result is shown on the seven-segment display. It supports the four arithmetic operations — add, subtract, multiply, and divide.

<figure>
  <div class="video-frame">
    <iframe
      src="https://www.youtube-nocookie.com/embed/NvBr_hBevYs"
      title="FPGA calculator demo running on the Basys 2 board"
      loading="lazy"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  </div>
  <figcaption>Demo: entering three operands and two operators on the Basys 2, and computing a two-stage result live on the seven-segment display.</figcaption>
</figure>

## How it works

The design is a top module (`Calc_Top`) wiring together custom submodules:

- **`Calc_Menu`** — a finite state machine that walks the user through entering operand A, operator 1, operand B, operator 2, and operand C, then triggers the calculation. LEDs indicate the current FSM state.
- **`Calc_Data`** — the datapath that performs the arithmetic, including a **sequential binary division** algorithm built as its own VHDL component (division doesn't come for free in hardware — it's implemented as a multi-cycle shift-and-subtract).
- **Seven-segment driver** for the result and the current input value, plus **button-debouncing** logic so a single press registers once.

## The hard parts

- **Division in hardware.** Add/subtract/multiply map onto the FPGA fabric readily; division doesn't. It's implemented as a sequential shift-and-subtract state machine that takes several clocks per result — the most involved component in the design, and the one that needed the most testbench attention.
- **A clean input flow.** Entering five things in sequence on a handful of buttons means the control FSM has to be unambiguous about which value it's capturing, and the button inputs have to be debounced so one physical press doesn't advance the state machine twice.

## Results

A working calculator on the Basys 2 that evaluates two-operator expressions across all four operations and displays the result live — demonstrated on hardware in the linked video.

## Tools & skills demonstrated

VHDL from the ground up: FSM design, a custom multi-cycle arithmetic datapath (including sequential division), seven-segment multiplexing, and input debouncing — implemented and verified on a real FPGA board.
