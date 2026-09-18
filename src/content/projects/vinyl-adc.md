---
title: 'Vinyl ADC: a discrete stereo converter'
summary: >-
  A stereo audio ADC built from op-amps and logic gates, with four milled PCBs visible through a printable organic lattice enclosure. Measured at 67.9 dB dynamic range and flat within ±0.06 dB across the audio band, against a simulated target of 68 dB.
date: 2026-09-03
tags: ['Analog electronics', 'Delta-sigma ADC', 'SPICE', 'DSP', 'KiCad', 'PCB design', 'Raspberry Pi', '3D CAD', 'Audio']
repo: 'https://github.com/MadsRudolph/vinyl-adc'
featured: true
order: 1.2
status: in-progress
hero: '/media/vinyl-adc/showcase/orbit-poster.png'
heroAlt: 'Vinyl ADC in a rounded open lattice enclosure, with four visible circuit boards, solid connector mounts and an acrylic lid'
---

Personal project. I designed the converter, simulated its analog behavior, and split the circuit into four boards that can be milled in-house.

<figure data-gif-showcase>
  <img src="/media/vinyl-adc/showcase/orbit-poster.png" data-gif-src="/media/vinyl-adc/showcase/orbit.gif" data-poster-src="/media/vinyl-adc/showcase/orbit-poster.png" width="720" height="540" loading="lazy" alt="A full orbit around the printable organic lattice enclosure" />
  <button type="button" class="btn secondary" style="margin-top:0.75rem" data-gif-toggle aria-pressed="false">Play GIF</button>
  <figcaption>The 105 mm tall lattice enclosure, with a clear acrylic lid and reinforced connector islands. CAD render; physical print validation is pending.</figcaption>
</figure>

## The challenge

Comparator delay limited the sampling rate. A third-order loop and delay compensation reached about **68 dB SNR in simulation**. SPICE also caught a reversed charge pump that connectivity checks missed.

## Measured results

The converter now runs in stereo and has been measured on the bench. The left channel came out within a fraction of a decibel of what SPICE predicted:

| | Simulated | Measured |
|---|---|---|
| SNR / dynamic range | ~68 dB | **67.9 dB** |
| Frequency response, 20 Hz–16.3 kHz | — | **±0.06 dB** |
| THD at −20 dBFS | — | **0.032 %** |
| Crosstalk | — | **−92 dB** |

<figure>
  <div style="overflow-x:auto">
  <a href="/media/vinyl-adc/frequency-response.svg" target="_blank" rel="noopener">
    <img style="min-width:680px;width:100%;max-width:900px;height:auto" src="/media/vinyl-adc/frequency-response.svg" width="900" height="380" loading="lazy" alt="Frequency response of both channels, third-octave points from 20 Hz to 16.3 kHz, flat within about a tenth of a decibel" />
  </a>
  </div>
  <figcaption>Both channels, measured at third-octave points. The whole vertical scale is a third of a decibel — the traces are flat within about 0.12 dB, which is the decimator's FIR filter behaving as designed. The sweep stops at 16.3 kHz because the next third-octave step would pass 20 kHz.</figcaption>
</figure>

For a machine whose source is a record, the benchmark is the source: a good pressing delivers 60–70 dB, so the converter is not the limit. Signal generation was an Analog Discovery 3, whose own 14-bit generator bounds any distortion or noise figure near −80 dB — several of the intermodulation results sit at that floor and are measuring the instrument, not the converter.

### How one bit gets there

The converter doesn't measure the voltage. It compares, a million and a half times a second, and outputs a single bit each time — so the *density* of ones carries the signal, not their value.

<figure>
  <div style="overflow-x:auto">
  <a href="/media/vinyl-adc/modulator-bits.svg" target="_blank" rel="noopener">
    <img style="min-width:680px;width:100%;max-width:900px;height:auto" src="/media/vinyl-adc/modulator-bits.svg" width="900" height="300" loading="lazy" alt="192 modulator bits from each channel drawn as filled cells, a fine irregular hatch at half density" />
  </a>
  </div>
  <figcaption>125 microseconds of the real output, both channels, with the inputs shorted. A fine irregular hatch sitting at half density means the loop is modulating. When the right channel was broken it looked completely different — long solid bars, oscillating rail to rail instead of tracking its input.</figcaption>
</figure>

Trading resolution for speed that way produces an enormous amount of quantisation noise. The trick is that a third-order feedback loop doesn't remove that noise, it *moves* it — out of the audio band and up into frequencies nothing needs, where the decimation filter discards it.

<figure>
  <div style="overflow-x:auto">
  <a href="/media/vinyl-adc/noise-shaping.svg" target="_blank" rel="noopener">
    <img style="min-width:680px;width:100%;max-width:900px;height:auto" src="/media/vinyl-adc/noise-shaping.svg" width="900" height="430" loading="lazy" alt="Noise power density of both 1-bit streams from 20 Hz to 768 kHz, flat at about -127 dBFS per hertz in the audio band then climbing steeply" />
  </a>
  </div>
  <figcaption>The noise density of both 1-bit streams, measured from the raw capture. Flat at about −127 dBFS/Hz across the audio band, then climbing roughly 68 dB per decade above it. The two channels lie on top of each other, which is the point: after the repairs their loops are indistinguishable. The spike near 13 kHz is the modulator's own idle tone.</figcaption>
</figure>

### A record through it

Measurements with a signal generator say what the converter can do. This is what it did with a record on the turntable — the first side ripped end to end, as the ripper delivered it to the library.

<figure>
  <div style="overflow-x:auto">
  <a href="/media/vinyl-adc/music-spectrogram.svg" target="_blank" rel="noopener">
    <img style="min-width:680px;width:100%;max-width:900px;height:auto" src="/media/vinyl-adc/music-spectrogram.svg" width="900" height="470" loading="lazy" alt="Spectrogram of 24 seconds of Everything in Its Right Place from the vinyl, 20 Hz to 20 kHz on a log axis, showing the electric piano's harmonic bands and the drums as vertical strokes" />
  </a>
  </div>
  <figcaption>Twenty-four seconds of <em>Everything in Its Right Place</em> off the vinyl. The horizontal bands are the electric piano's harmonics, the vertical strokes are the drums. This rip was made before the right-channel repair — the ripper noticed the oscillating loop and fell back to mono, copying the left channel to both sides — so a true stereo rip is the next thing on the list.</figcaption>
</figure>

<figure>
  <div style="overflow-x:auto">
  <a href="/media/vinyl-adc/music-vs-floor.svg" target="_blank" rel="noopener">
    <img style="min-width:680px;width:100%;max-width:900px;height:auto" src="/media/vinyl-adc/music-vs-floor.svg" width="900" height="430" loading="lazy" alt="Average spectrum of the record excerpt plotted over the converter's idle noise floor, about 70 dB apart at 1 kHz" />
  </a>
  </div>
  <figcaption>The same excerpt's average spectrum over the converter's own idle floor, measured with the inputs shorted and the same FFT. The record sits about 70 dB above the floor at 1 kHz; the shaded band is the converter's headroom. The record's own noise above 10 kHz is the groove, not the electronics.</figcaption>
</figure>

Getting there took finding two faults in the right channel that had hidden each other. Its negative supply reached the board only through solder that had wicked up an unplated hole beneath a connector body, where no iron can reach — the board's own KiCad data showed ten connections that depend on a joint on the component side. Underneath that sat a short to ground on the feedback DAC's output, which left the loop with no feedback at all: every integrator ran into the rails and the whole channel oscillated at 42 kHz. Both channels now shape noise identically at the bitstream level.

The measurement itself needed debugging before the hardware could be trusted. Because the ADC generates its own sample clock at 48009 Hz rather than exactly 48000, test tones landed about 190 ppm low and walked out of the analysis window in proportion to frequency — which looked convincingly like a steep analogue rolloff above 5 kHz, and wasn't.

**Current status:** Both channels work and are characterised. The right channel's loop is provably identical to the left, but its input path costs it 9 dB of noise, with an intermittent level trimmer the leading suspect. Absolute input level, running from the Raspberry Pi's own 5 V, and the enclosure as a physical print are still open. The [full test and verification record](https://github.com/MadsRudolph/vinyl-adc/blob/main/docs/test-and-verification.md) covers the method, the instrument's limits and everything not yet verified; the [assembly guide and bench log](https://vinyl-adc.madsrudolph.dev/) include graphical probe connections and actual readings.

<figure data-gif-showcase>
  <img src="/media/vinyl-adc/showcase/electronics-poster.png" data-gif-src="/media/vinyl-adc/showcase/electronics.gif" data-poster-src="/media/vinyl-adc/showcase/electronics-poster.png" width="720" height="540" loading="lazy" alt="The four populated Vinyl ADC circuit boards" />
  <button type="button" class="btn secondary" style="margin-top:0.75rem" data-gif-toggle aria-pressed="false">Play GIF</button>
  <figcaption>Power, right channel, left channel, and digital interface, from bottom to top.</figcaption>
</figure>

## Printable enclosure

Rounded branches leave all four sides open so the boards remain visible. The enclosure is **144 × 144 × 105 mm**, adding 40 mm for the taller stack and cable routing. Solid mounting islands surround the connectors. Thicker corner ribs support the four M3 heat-set lid inserts, while the original acrylic lid pattern is retained.

The mesh is a single watertight part and has been sliced with organic supports. **Supports are required** for the branch overhangs and upper rim; a successful slice is not a physical strength or fit test. The print package includes STL and 3MF files, reference print settings and a small insert-fit coupon. Board spacing in the animation is illustrative.

[Download the enclosure and printing instructions](https://github.com/MadsRudolph/vinyl-adc/tree/main/enclosure) · [Download all three GIFs](https://github.com/MadsRudolph/vinyl-adc/tree/main/media/showcase)

<figure data-gif-showcase>
  <img src="/media/vinyl-adc/showcase/assembly-poster.png" data-gif-src="/media/vinyl-adc/showcase/assembly.gif" data-poster-src="/media/vinyl-adc/showcase/assembly-poster.png" width="720" height="540" loading="lazy" alt="The PCB stack and acrylic lid lift out of the lattice enclosure and reassemble" />
  <button type="button" class="btn secondary" style="margin-top:0.75rem" data-gif-toggle aria-pressed="false">Play GIF</button>
  <figcaption>The CAD assembly opens to show the PCB stack and lid.</figcaption>
</figure>

[Code, design files & full documentation →](https://github.com/MadsRudolph/vinyl-adc)
