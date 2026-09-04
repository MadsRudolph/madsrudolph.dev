---
title: 'Sub crossover: a measured line-level low-pass for a Bose bass module'
summary: >-
  A mono-summing Sallen-Key low-pass that lets a Bose Companion 5 bass module
  join a hi-fi chain — designed only after measuring the module, built from
  the DTU parts shop on a milled board, and verified gate by gate on an Analog
  Discovery 3 against its own model.
date: 2026-08-17
tags: ['Analog electronics', 'Audio', 'Filter design', 'Op-amp (TL072)', 'Measurement', 'KiCad', 'PCB design', '3D CAD']
repo: 'https://github.com/MadsRudolph/personal-projects'
featured: true
order: 1.3
status: in-progress
hero: '/media/subxo/card.jpg'
heroAlt: 'The finished crossover: black printed box with a clear acrylic lid, two knobs and a toggle on the front, a 3.5 mm lead plugged in'
---

<figure>
  <video src="/media/subxo/assembly.mp4" poster="/media/subxo/assembly-poster.jpg" width="1280" height="720" autoplay loop muted playsinline></video>
  <figcaption>The assembly opened up: printed base, milled board from the KiCad export, acrylic lid, and the panel hardware. Corner, level and polarity on the front; RCA in, 3.5 mm out and DC in on the back.</figcaption>
</figure>

## What it is

A spare Bose Companion 5 bass module, put to work as a second bass source in my main chain (Schiit Saga → Fosi → JBL 4412). **This board is the crossover that makes it fit**: it sums left and right, low-passes with a switched corner, adds a polarity flip and a level trim, and drives the module's aux input. The main path is untouched; pull one Y-adapter and it is gone.

<figure>
  <img src="/media/subxo/photo-product.jpg" alt="The finished crossover on the lab bench: black 3D-printed box, clear acrylic lid showing the board, corner and level knobs and a polarity toggle on the front, 3.5 mm lead to the Bose pod" width="1600" height="1200" />
  <figcaption>The finished box at DTU Ballerup. Corner selector, level and polarity on the front; the 3.5 mm lead goes to the Bose control pod.</figcaption>
</figure>

It is a small analog board, done the way a filter should be: measure what you are designing for, design to the parts you have, then measure the result against a model until they agree.

## Measure first

The plan was a textbook 50–60 Hz Linkwitz-Riley. Before drawing it I characterised the module with the Analog Discovery 3, REW and a microphone, because three things could sink the plan: a coupling cap on the aux input, a DSP in the path, and the module's own filtering.

<figure>
  <img src="/media/subxo/companion5-nearfield.png" alt="Nearfield SPL of the Companion 5 bass module, cone and port, showing a 63 to 203 Hz bandpass with steep rolloffs on both sides" width="1600" height="1213" />
  <figcaption>Nearfield sweep, cone and port. A 63–203 Hz bandpass: 25 dB/octave below, 39 dB/octave above. Not a subwoofer.</figcaption>
</figure>

- **Aux input:** 8.9 kΩ with 2.4 nF, input high-pass at 0.4 Hz. Nothing lost at the bottom; the capacitance wants a series resistor on the output.
- **Latency:** 0 ms, resolved to half a microsecond. The path is analog, so a polarity switch is meaningful.
- **The module is a 63–203 Hz bandpass.** Nothing below 63 Hz, and its own low-pass above 203 Hz is steeper than anything I would build. A 50 Hz filter would deliver almost nothing; the usable band is 85–190 Hz and second order is enough.
- **Tip plus ring sums +5.4 dB** inside the module, so the board drives both and needs no make-up gain.

The honest conclusion: this adds midbass output and room-mode averaging. It does not extend the bottom end.

## Design to the parts shop

One TL074 does everything: filter follower, unity inverter for polarity, buffered virtual ground, spare section terminated. The summing resistors double as the Sallen-Key's first resistor, which saves a buffer stage. Three switched capacitor pairs give three corners at the same Q; switching capacitors keeps the filter's shape where a ganged pot would skew it.

Every part is from the DTU shop. When 270 nF turned out not to exist, the fix was an 8.25 kΩ resistor so the stocked pairs landed on even corners: E96 resistors give more freedom than E12 capacitors, so move the resistor. Two errors were caught in review before anything was built: a missing DC bias path that would have parked the op-amp on a rail, and a level pot referenced to virtual ground that would have put 6 V on the output.

The board is single-sided, milled on the SRM-20 with [SRM-CAM](/projects/srm-cam), in a printed enclosure with a laser-cut lid.

<figure>
  <img src="/media/subxo/photo-interior.jpg" alt="Top-down photo of the milled board inside its box: TL074 in the middle, LM7812 and reservoir capacitors on the right, the film capacitor bank and jumper headers on the left, screw terminals along the rear and front edges, flying leads to the panel hardware" width="1200" height="1440" />
  <figcaption>Rev B in its base. TL074 in the middle, regulator and reservoirs right, the switched capacitor bank left. Screw terminals take flying leads to the panel parts.</figcaption>
</figure>

## What the measurements found

Bring-up runs as numbered gates on the Analog Discovery 3, scripted so every sweep repeats, and a failed gate stops the run.

<figure>
  <img src="/media/subxo/photo-bench.jpg" alt="The open crossover box on the bench during bring-up, wired through a breadboard to an Analog Discovery 3, with multimeter probes and a laptop showing the gate script" width="1400" height="1750" />
  <figcaption>Gate 5 in progress: board to breadboard to Analog Discovery 3, meter on the rails, gate script on the laptop.</figcaption>
</figure>

<figure>
  <img src="/media/subxo/gate5-bode.png" alt="Bode plot of the crossover board: three measured low-pass curves at 95, 137 and 179 Hz sitting on the as-built model, with the 20–120 Hz band the bass module plays shaded" width="1600" height="1209" />
  <figcaption>The three rotary positions. Points are the board, lines the as-built model. Corners at 94.9, 136.9 and 179.0 Hz, each within 0.2 dB of prediction, repeatable to 0.1 Hz.</figcaption>
</figure>

**The coupling capacitors were inside the filter.** The built board used 220 nF input caps where the design said 2.2 µF, and in series with the filter's first resistor that reactance is part of the filter. The first sweep settled it: ideal formula 128.6 Hz, design value 112.5 Hz, as-built model 121.5 Hz, board 122.0 Hz.

**One capacitor was 6% low, proven out-of-sample.** Every rev A setting using the 68 nF part sat 5% high. A five-parameter fit put it at 63.8 nF and then predicted three unmeasured settings to 0.7%, where the nominal model missed by 5.2%. When rev B's same detent failed on shape, the same method showed a different 68 nF had gone in, and that one was nominal. The board was never at fault.

**The instrument was the noise floor.** 58 µV rms over 10 Hz–1 kHz with the switch frame grounded, 75 µV lifted, against a 1 mV target. Above 200 Hz the floor is about twenty times what a TL074 follower should produce, which is the Analog Discovery's own input noise. Grounding the frame is worth 3 dB at mains.

**Mains harmonics leaked into the polarity gate.** Every bad point sat within two bin widths of a multiple of 50 Hz. A 128-cycle window resolved them, and the inverter measured −0.002 dB and 180.08°.

**Clipping landed where the rails said.** 1% THD at 4.31 V peak out, 3.52 V rms in, 1.69 V from each 12 V rail. Within 0.2 V of what a TL074 gives up.

## Results

- Three corners at 94.9, 136.9 and 179.0 Hz, within 0.2 dB of the model.
- Mono sum −6.00 / −5.95 dB per channel against −6.02 dB ideal.
- Noise 58 µV rms broadband, 39 µV at mains, instrument-limited.
- Headroom 3.52 V rms in before 1% THD, linear to ±0.01 dB over a sevenfold drive range.
- Every part from the shop; single-sided board, printed enclosure, laser-cut lid.

<figure>
  <div class="fig-row">
    <img src="/media/subxo/photo-front.jpg" alt="Front of the finished crossover: large corner knob with an index dot, smaller level knob, polarity toggle, acrylic lid held by four screws" width="1400" height="1050" />
    <img src="/media/subxo/photo-rear.jpg" alt="Rear of the finished crossover: DC barrel jack, 3.5 mm output lead, red and white RCA inputs" width="1400" height="1050" />
  </div>
  <figcaption>Front and back. Corner, level and polarity; 15 V in, 3.5 mm out, RCA in.</figcaption>
</figure>

## Status

Verified through the filter and polarity stages. The last gate, pot to jack, failed: tip and ring, joined through 200 Ω, disagreed by 0.5 dB with wandering phase, so two floating nodes rather than one attenuated signal. The break is downstream of the pot, and the next session starts with a meter on ohms. Then the in-situ acoustic measurement.

## Tools & skills demonstrated

Characterising a black-box audio device before designing for it; active filter design to a real inventory; single-supply op-amp practice; scripted, gated bring-up with a model fitted and then tested on held-out data; reading measurement artefacts for what they are; an enclosure designed around the board.
