---
title: 'Oscilloscope and signal generator'
summary: >-
  A complete instrument linking an AVR microcontroller, FPGA waveform generator, and LabVIEW display.
date: 2026-04-15
tags: ['C / firmware', 'VHDL', 'FPGA', 'UART', 'SPI', 'LabVIEW', 'Coursework']
repo: 'https://github.com/Skab101/Oscilloscope_Project'
featured: false
order: 12
status: working
kind: coursework
hero: '/media/oscilloscope/combined.png'
heroAlt: 'LabVIEW oscilloscope display showing a captured sine wave with the generator signal overlaid'
---

Group project for DTU 30082. The ATmega2560 captures samples, LabVIEW plots them, and a Basys 2 generates adjustable waveforms through PWM and an analog filter.

<figure>
  <img loading="lazy" src="/media/oscilloscope/combined.png" alt="LabVIEW oscilloscope display showing a captured sine wave with the generator signal overlaid" width="1176" height="500" />
  <figcaption>Captured signal and generator activity in the LabVIEW interface.</figcaption>
</figure>

## The challenge

Sampling had to stay consistent while the MCU handled UART and SPI traffic. Explicit frame lengths, synchronization bytes, and a checksum supported reliable communication.

## Results

- Live waveform capture and display.
- Signal-generator commands sent from the PC through the MCU to the FPGA.
- Analog reconstruction filter checked in LTspice.

[Code, design files & full documentation →](https://github.com/Skab101/Oscilloscope_Project)
