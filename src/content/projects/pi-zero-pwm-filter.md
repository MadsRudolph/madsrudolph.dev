---
title: 'Pi Zero: PWM-to-audio filter'
summary: >-
  A Spotify Connect receiver that turns Raspberry Pi PWM into line-level audio through an analog low-pass filter.
date: 2025-09-01
tags: ['Analog electronics', 'Filter design', 'PWM DAC', 'Op-amp (TL072)', 'Raspberry Pi', 'Measurement']
repo: 'https://github.com/MadsRudolph/personal-projects'
order: 8
status: working
hero: ''
heroAlt: 'Protoboard PWM filter with the Pi Zero and measured frequency response'
---

An early personal project using a Pi Zero and a TL072 active filter.

## The challenge

Full-scale PWM pushed the analog stage toward its rails and exposed hiss on a high-gain preamp. Sweeping output level helped find a cleaner operating point.

## Results

- Working stereo playback into active speakers and a preamp.
- Measured the filter and compared left/right output behavior.

[Code, design files & full documentation →](https://github.com/MadsRudolph/personal-projects)
