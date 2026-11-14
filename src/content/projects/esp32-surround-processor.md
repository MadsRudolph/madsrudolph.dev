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
hero: '/media/esp32-surround-processor/render-hero_stacked.webp'
heroAlt: 'The surround processor: a bare-copper milled board with two DAC modules and the green optical receiver module stacked on top'
---

Personal project. My TV has an optical output, I have a stereo amplifier with two large front speakers, and a pair of small active monitors behind the couch. This board sits between them: optical in, four line outputs, and the surround decoding done in firmware on an ESP32.

<figure>
  <a href="/media/esp32-surround-processor/render-hero_stacked.webp" target="_blank" rel="noopener"><img src="/media/esp32-surround-processor/render-hero_stacked.webp" width="1920" height="1280" alt="Render of the assembled processor: the milled copper board with regulators, capacitors and screw terminals, and the green receiver module stacked above the two DAC modules with a six-wire pigtail looping over" /></a>
  <figcaption>The assembled processor, with the optical receiver module stacked over the two DAC modules. Render from the KiCad board file; the modules are simplified stand-ins.</figcaption>
</figure>
<!-- PHOTO NEEDED: the real board on the bench, and one of it wired to the amplifier and the rear speakers -->

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
  <a href="/media/esp32-surround-processor/render-top_34.webp" target="_blank" rel="noopener"><img src="/media/esp32-surround-processor/render-top_34.webp" width="1920" height="1280" loading="lazy" alt="Render of the top face: bare copper ground plane with the dark laser legend, two DAC modules, two regulators, capacitors and screw terminals" /></a>
  <figcaption>Top face: bare copper, nearly all of it ground, with the legend put on by a fibre laser. Render.</figcaption>
</figure>

<figure>
  <a href="/media/esp32-surround-processor/render-bottom_34.webp" target="_blank" rel="noopener"><img src="/media/esp32-surround-processor/render-bottom_34.webp" width="1920" height="1280" loading="lazy" alt="Render of the bottom face: green solder mask over the signal routing, the ESP32 module with its antenna past the board edge, and four standoffs" /></a>
  <figcaption>Bottom face: every signal, under a hand-applied solder mask, and the ESP32 module with its antenna off the board edge. Render.</figcaption>
</figure>

<figure>
  <a href="/media/esp32-surround-processor/board-bottom.webp" target="_blank" rel="noopener"><img src="/media/esp32-surround-processor/board-bottom.webp" width="1900" height="1366" loading="lazy" alt="Layer plot of the bottom copper: all signal routing and the ESP32 module pads" /></a>
  <figcaption>The bottom copper as the mill cuts it. Layer plot from KiCad.</figcaption>
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
- **Resets inside the box on a 12 V adapter.** The 3.3 V comes from an LM317 fed from the input voltage. On 12 V, in the closed box, it dissipated about half as much again as on 9 V, got too hot, and the ESP32 reset from brown-out every second or so; the serial log showed the resets coming before Wi-Fi had even started, so it was not the radio's current peaks. On the 9 V adapter the board is designed for it runs without a reset. Feeding the LM317 from the 5 V rail would make a 12 V adapter safe.
- **The mute pin does not mute.** The DAC modules ignore the ESP32's mute line, most likely because their own strap is still fitted. Mute is done in the audio data, which works either way.

## Enclosure

<figure>
  <a href="/media/esp32-surround-processor/enclosure-closed-front.webp" target="_blank" rel="noopener"><img src="/media/esp32-surround-processor/enclosure-closed-front.webp" width="1600" height="1100" loading="lazy" alt="Render of the enclosure: a dark printed base with a volume knob on the front and a clear acrylic lid through which the board is visible" /></a>
  <figcaption>The enclosure as designed: a printed base and a laser-cut lid in clear acrylic. Design render.</figcaption>
</figure>

The enclosure is a printed base with a lid cut from 4 mm clear acrylic, held by M3 screws in heat-set inserts. The optical and coax inputs, four RCA outputs and the 9 V jack sit on the rear panel, and the volume knob on the front, away from the antenna. It is a parametric FreeCAD model generated from a Python script, checked for collisions against the board's 3D export. It is built on caliper measurements of the finished board. Two openings were corrected from test prints: the RCA holes went from 7.3 to 8.0 mm, and the receiver's three connectors sat 4 mm off on the first print. A 20-minute strip of the rear wall showed the first correction overshot by 2 mm, and the final print fits. The base is printed in PLA with a fuzzy-skin finish.

<figure>
  <a href="/media/esp32-surround-processor/enclosure-exploded.webp" target="_blank" rel="noopener"><img src="/media/esp32-surround-processor/enclosure-exploded.webp" width="1500" height="1500" loading="lazy" alt="Exploded render: base, carrier board with the receiver module above it, the USER button cap and the acrylic lid" /></a>
  <figcaption>Base, board, receiver module, button cap and lid. Design render.</figcaption>
</figure>

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

### Tested in the finished box

With the box closed and on its 9 V adapter, I fed it S/PDIF from the Analog Discovery 3: a small script turns the AD3's pattern generator into an S/PDIF transmitter, through two resistors into the coax input, with a 1 kHz tone on the left and 1.5 kHz on the right at −12 dBFS. The AD3's scope read the RCA outputs. The receiver locks in 2 to 3 seconds and the ESP32 sees exactly the −12.0 dBFS that is sent.

<figure>
  <a href="/media/esp32-surround-processor/box-rear-matrix.svg" target="_blank" rel="noopener">
    <img style="min-width:680px;width:100%;max-width:900px;height:auto" src="/media/esp32-surround-processor/box-rear-matrix.svg" width="900" height="400" loading="lazy" alt="Rear outputs in surround mode for three inputs: left with inverted right gives about 0.49 V rms on both rears, left equal to right gives 2 mV, and left only gives about 0.245 V" />
  </a>
  <figcaption>The rear matrix, measured on the two rear outputs. Half of left minus right: a sound that is the same in both channels cancels by more than 47 dB, and one in antiphase comes out at full level.</figcaption>
</figure>

<figure>
  <a href="/media/esp32-surround-processor/box-output-levels.svg" target="_blank" rel="noopener">
    <img style="min-width:680px;width:100%;max-width:900px;height:auto" src="/media/esp32-surround-processor/box-output-levels.svg" width="900" height="350" loading="lazy" alt="Line output level of the four outputs: 0.514, 0.501, 0.518 and 0.503 V rms on the bench against 0.484, 0.456, 0.488 and 0.458 V rms in the finished box" />
  </a>
  <figcaption>Each output carries its own channel at 0.46 to 0.49 V rms. The box reads 0.5 to 0.8 dB under the bench values, which used a different signal source and different leads, so I read little into the difference. On both runs the right channel of each DAC is the lower one.</figcaption>
</figure>

The volume pot, mute and the mode button all work through the printed panel, and the mode button switches the rears between the matrix, a copy of the fronts, and off.

What is not done: the optical input has not yet been tried with a TV in the closed box, the level match between front and rear is set by ear, and liba52 is a third-party decoder (GPL, which is why the firmware is published under GPL 3). Writing my own AC-3 decoder is the next step.

## Tools and skills

- **PCB design for the process I have:** double-sided, no vias, isolation-milled, layout and routing as code with a connectivity proof for bare holes.
- **Embedded C on ESP-IDF:** two I2S ports as slaves on shared external clocks, DMA audio, a decoder task with a ring buffer between two cores, over-the-air updates with rollback.
- **Finding faults by measurement:** per-port counters that exposed a vendor driver bug, an A/B control that proved a signal-integrity cause by ear, and a timing experiment that pointed at four lines of a decoder.
- **DSP:** IEC 61937 framing, AC-3 downmix to a 4.0 layout, a matrix surround path with Butterworth filters and a delay line.
- **Test tooling:** a Python server and web pages that put scope traces, the test procedure and live firmware state in one place.
