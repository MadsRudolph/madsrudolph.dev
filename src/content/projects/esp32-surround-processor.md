---
title: 'ESP32 surround processor: Dolby Digital on a milled board'
summary: >-
  A four-speaker surround processor on a double-sided board I milled myself, with no vias. An ESP32 takes the TV's optical output, decodes Dolby Digital 5.1 in about 5 ms per 32 ms frame, and drives two DACs: front pair and rear pair.
date: 2026-11-12
tags: ['ESP32', 'C / firmware', 'DSP', 'Audio', 'KiCad', 'PCB design', 'Measurement', 'Python']
repo: 'https://github.com/MadsRudolph/esp32-surround-processor'
featured: false
order: 1.25
status: working
kind: personal
hero: '/media/esp32-surround-processor/board-top.webp'
heroAlt: 'Top face of the surround processor board: a ground plane with the silkscreen, two DAC module positions and the ESP32 at the east edge'
---

Personal project. My TV has an optical output, I have a stereo amplifier with two large front speakers, and a pair of small active monitors behind the couch. This board sits between them: optical in, four line outputs, and the surround decoding done in firmware on an ESP32.

<div class="media-placeholder">PHOTO: the assembled board with both DAC modules, the receiver module and the volume pot</div>
<!-- PHOTO NEEDED: assembled board on the bench, and one of it wired to the amplifier and the rear speakers -->

## What it does

- **Dolby Digital 5.1 from the TV** is decoded on the ESP32. The centre channel is folded into the front pair, the subwoofer channel is added to both fronts (my subwoofer takes its feed from them), and surround left and right go straight to the two rear speakers.
- **Plain stereo** passes to the fronts untouched, and the rears get a matrix signal: half of left minus right, band-limited to 100 Hz–7 kHz and delayed 20 ms so the fronts always arrive first.
- **DTS and Dolby Digital Plus** are recognised and kept silent. Played as if they were audio they would be full-level noise.
- A potentiometer sets the volume of all four outputs, and the board updates over Wi-Fi.

<figure>
  <img src="/media/esp32-surround-processor/signal-chain.svg" width="1200" height="420" loading="lazy" alt="Block diagram: TV optical output into a DIR9001 receiver, data into the ESP32, two PCM5102 DACs for the front and rear pairs, with the receiver's clocks going to the ESP32 and both DACs" />
  <figcaption>The receiver recovers the clocks from the optical signal and everything else follows them. The ESP32 is a slave on both of its I2S ports.</figcaption>
</figure>

## The board

The board is 101.9 × 73.2 mm with copper on both faces, cut on a desktop CNC mill with a 0.8 mm ball mill. The holes are not plated and there are **no vias and no wire links**. The two faces meet only where a component lead is soldered on the top as well as the bottom: 19 joints in all, each one chosen so the iron can reach it. The top face is a ground plane, and every clock, data and audio net stays on the bottom.

<figure>
  <a href="/media/esp32-surround-processor/board-top.webp" target="_blank" rel="noopener"><img src="/media/esp32-surround-processor/board-top.webp" width="1900" height="1366" loading="lazy" alt="Top face of the board: ground plane, laser silkscreen labels, and two supply runs" /></a>
  <figcaption>Top face: ground plane, the two supply runs, and the silkscreen that goes on with a fibre laser. CAD render.</figcaption>
</figure>

<figure>
  <a href="/media/esp32-surround-processor/board-bottom.webp" target="_blank" rel="noopener"><img src="/media/esp32-surround-processor/board-bottom.webp" width="1900" height="1366" loading="lazy" alt="Bottom face of the board with all signal routing and the ESP32 module pads" /></a>
  <figcaption>Bottom face: all the signals, and the ESP32 module's castellated pads. CAD render.</figcaption>
</figure>

The layout is written as code: named anchors, a placement table on a 1.27 mm grid, and routing lanes, so a full place-and-route run takes seconds and every change is looked at in a render. A separate check proves the board is connected with bare holes, which KiCad's own rule check cannot do.

## Bring-up with a scope that draws on the test page

I tested the board with a bench supply, a multimeter and an Analog Discovery 3. The test procedure is a local web page, and the same page drives the scope through its SDK, so each step shows its own measurement: rails, ripple, a long recording that hunts for supply dips, and the serial console.

Measured before any firmware ran: 4.98 V and 3.21 V on the two rails, 128 mA from the 9 V supply. With a test firmware playing a 1 kHz tone at −12 dBFS, the four outputs gave 0.514, 0.501, 0.518 and 0.503 V rms, each one silent while another played.

## What went wrong and how it was diagnosed

- **The power LED stayed dark.** Its supply reaches it through one of the 19 leads soldered on both faces, and some of those top-face joints had not taken. Bare holes make every such joint a possible open circuit; re-soldering them fixed it.
- **Loud clicks, like popcorn, part one: a bug in the vendor's I2S driver.** I put a counter on each audio port and found that the port feeding the front DAC finished several fewer buffers every ten seconds than the other two, though all three run on the same clock. In ESP-IDF 5.5, on the original ESP32 in full duplex, the receive and transmit interrupt handlers share one interrupt and each clears every pending flag. When both events were pending, one handler erased the other's, and 5 ms of audio went missing. I patched a copy of the driver so each handler clears only its own flag. After that the three ports stayed exactly in step: 15,007 buffers each over the test run.
- **Clicks, part two: the data lines were driven too hard.** With the buffers no longer lost, clicks remained, and one observation located them: a test sound on any single speaker was clean, the same sound on all four clicked. That needs both data lines switching together. At the ESP32's default drive strength their edges disturbed the clock lines they run beside, and the DACs misread bits. I made the drive strength adjustable from the debug page and listened: clean on the two weakest settings, clicking on the default, severe on the strongest. The firmware uses the weakest. On the next revision the data lines get ground between them and the clocks.
- **A false alarm I caused myself.** The first crackle appeared when the volume pot was fitted. The ADC reading wobbles by about ±20 counts, and the firmware applied each wobble as a small volume step twenty times a second. A dead band and a per-sample glide removed it.
- **The decoder was 3 % too slow.** The first Dolby Digital build took 33.7 ms to decode a frame that lasts 32 ms, so the sound broke up. Running at 240 MHz and giving the decoder a core to itself brought it to 21 ms. An experiment then showed where the time went: decoding to two channels in place of four took half as long, so the cost was in the per-channel transform. The decoder library (liba52) keeps its FFT temporaries in double precision, and the ESP32 has no hardware for doubles. Changing four declarations to single precision brought it to about 5 ms.
- **The mute pin does not mute.** The DAC modules ignore the ESP32's mute line, most likely because their own strap is still fitted. Mute is done in the audio data, which works either way.

## Results

<figure>
  <a href="/media/esp32-surround-processor/debug-page.webp" target="_blank" rel="noopener"><img src="/media/esp32-surround-processor/debug-page.webp" width="1150" height="1050" loading="lazy" alt="The board's debug page while a film plays: Dolby Digital 3/2.1 detected, volume, a per-speaker test panel, and level meters for left, right and the rear channels" /></a>
  <figcaption>The debug page while a film plays. It reads the board over Wi-Fi, and its speaker test plays a chime or a sine sweep on one output at a time.</figcaption>
</figure>

| | Measured |
|---|---|
| Dolby Digital decode time | 5.3 ms average per 32 ms frame, 640 kbit/s 5.1, with a film playing |
| Damaged frames | 0 in 48,044 decoded (about 25 minutes) |
| Channel separation, 5.1 test file | each channel on its own output, the others below −108 dBFS |
| Buffers lost after the driver fix | 0 |
| Line outputs, 1 kHz at −12 dBFS | 0.50–0.52 V rms on all four |

The decoder and the bitstream parser are plain C with no ESP32 calls, so the same code builds on a PC. A script wraps any film's AC-3 track the way a TV does, runs it through, and prints the level of each of the four outputs per second. A 5.1 test file I generated, with a known sound in one channel at a time, came out on the right outputs there before the firmware was ever flashed.

What is not done: the board has no enclosure yet, the level match between front and rear is set by ear, and liba52 is a third-party decoder (GPL, which is why the firmware is published under GPL 3). Writing my own AC-3 decoder is the next step.

## Tools and skills

- **PCB design for the process I have:** double-sided, no vias, isolation-milled, layout and routing as code with a connectivity proof for bare holes.
- **Embedded C on ESP-IDF:** two I2S ports as slaves on shared external clocks, DMA audio, a decoder task with a ring buffer between two cores, over-the-air updates with rollback.
- **Finding faults by measurement:** per-port counters that exposed a vendor driver bug, an A/B control that proved a signal-integrity cause by ear, and a timing experiment that pointed at four lines of a decoder.
- **DSP:** IEC 61937 framing, AC-3 downmix to a 4.0 layout, a matrix surround path with Butterworth filters and a delay line.
- **Test tooling:** a Python server and web pages that put scope traces, the test procedure and live firmware state in one place.
