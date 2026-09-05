---
title: 'FPGA calculator'
summary: >-
  A VHDL calculator on a Basys 2, evaluating two-stage arithmetic expressions with results on a seven-segment display.
date: 2026-04-15
tags: ['VHDL', 'FPGA', 'Digital design', 'FSM', 'Coursework']
repo: 'https://github.com/Skab101/FPGA_Calculator'
featured: false
order: 13
status: working
kind: coursework
---

Coursework for DTU 30081. Three operands and two operators are entered using the board’s switches and buttons.

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
  <figcaption>Entering and evaluating an expression on the Basys 2.</figcaption>
</figure>

## The challenge

Division required a custom, multi-cycle shift-and-subtract unit. A control state machine and debounced buttons kept the input sequence predictable.

## Results

- Addition, subtraction, multiplication, and division on hardware.
- Evaluates **(A op B) op C**.
- Physical demonstration shown below.

[Code, design files & full documentation →](https://github.com/Skab101/FPGA_Calculator)
