---
title: 'Pi Zero Spotify streamer with a PWM-to-audio filter'
summary: >-
  An early project: turning a Raspberry Pi Zero into a Spotify Connect endpoint
  by filtering its PWM audio output through a Sallen-Key analog stage — measured,
  not guessed.
date: 2025-09-01
tags: ['Analog electronics', 'Filter design', 'PWM DAC', 'Op-amp (TL072)', 'Raspberry Pi', 'Measurement']
repo: 'https://github.com/MadsRudolph/personal-projects'
order: 8
status: working
hero: ''
heroAlt: 'Protoboard PWM filter with the Pi Zero and measured frequency response'
---

<!-- PHOTO NEEDED: the protoboard filter build next to the Pi Zero, and one of the measured frequency-response captures. -->
<div class="media-placeholder">HERO: protoboard filter + Pi Zero + measured response</div>

## What it is

A Raspberry Pi Zero 2W running Raspotify (Spotify Connect) with a **home-built analog filter** turning the Pi's PWM audio output into a clean line-level stereo signal. I'm including this one deliberately as an *early* project — it's simpler than the rest of this site, but it's where I started taking measurements seriously instead of trusting that a circuit "sounded fine."

## Problem / motivation

The Pi Zero has no real audio DAC — it generates sound by PWM, a square wave switching at 31.25 kHz whose duty cycle encodes the audio. Fed straight to an amp, that carries a lot of ultrasonic switching energy. The job is a reconstruction filter: pass the audio band, kill the 31.25 kHz carrier, without wrecking the signal in between.

## Architecture / approach

A multi-stage filter: passive RC attenuation into an active **TL072** op-amp (Sallen-Key) stage, out to line level through screw terminals. I designed it to attenuate hard at the PWM carrier frequency while keeping the audio band flat, then actually verified it on the bench with an Analog Discovery rather than assuming the component values were right.

## What went wrong and how it was diagnosed

**The right ALSA volume is a hardware question, not a taste one.** Driving the PWM output at full digital scale pushed the analog stage toward its rails and raised the noise floor — audible as hiss when feeding a high-gain input (a Schiit Saga preamp made it obvious where active speakers hid it). Sweeping the ALSA PCM volume and measuring, the clean operating point was around **75% (≈ −22.6 dB)**: enough level for a good signal, low enough to keep the op-amp stage linear. That's a setting you can only find by measuring the output, not by ear alone.

<!-- VERIFY: confirm the two headline numbers below from your saved captures — PWM attenuation figure and the ALSA volume / dB value — before publishing, and swap in the real measured plots. -->

## Results

- Measured PWM-carrier attenuation of about **−40.6 dB at 31.25 kHz** <!-- VERIFY -->.
- Clean line-level stereo output, validated against active speakers and a preamp.
- Documented the optimal ALSA volume operating point (~75%, ≈ −22.6 dB) from measured captures, including left/right channel comparison and troubleshooting shots.

## Tools & skills demonstrated

Analog filter design (Sallen-Key, op-amp stages), understanding a PWM "DAC" and its reconstruction problem, and — the reason it's here — the habit of characterizing a circuit with instruments and choosing the operating point from data.
