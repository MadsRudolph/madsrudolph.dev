---
title: 'Vinyl ADC: a discrete 3rd-order delta-sigma audio ADC from op-amps and 74HC logic'
summary: >-
  A stereo audio ADC for digitising vinyl with no ADC chip anywhere in it — a
  continuous-time third-order delta-sigma modulator built from TL07x op-amps,
  an LM311 comparator and 74HC gates, clocked at 1.536 MHz and streamed to a
  Raspberry Pi as standard I2S. Designed against what the DTU component shop
  actually stocks, verified in SPICE, and laid out as four CNC-milled boards.
date: 2026-09-03
tags: ['Analog electronics', 'Delta-sigma ADC', 'SPICE', 'DSP', 'KiCad', 'PCB design', 'Raspberry Pi', '3D CAD', 'Audio']
repo: 'https://github.com/MadsRudolph/vinyl-adc'
featured: true
order: 1.2
status: in-progress
hero: '/media/vinyl-adc/pcb-channel-3d.jpg'
heroAlt: 'Raytraced KiCad render of the Vinyl ADC channel board — TL072 integrators, LM311 comparator, 74HC74 and 74HC04, a multi-turn trimmer, and the 16-way ribbon header'
---

<figure>
  <video src="/media/vinyl-adc/assembly.mp4" poster="/media/vinyl-adc/assembly-poster.jpg" width="800" height="450" autoplay loop muted playsinline></video>
  <figcaption>The four-board stack, exploded — power at the bottom, the two identical channel boards, and the digital board with the crystal can and Pi header on top. Each 100 × 100 mm board is isolation-milled on the SRM-20 and joined by ribbon cable and M3 standoffs. An <a href="https://madsrudolph.github.io/vinyl-adc/">interactive 3D viewer</a> lets you scrub the explosion yourself.</figcaption>
</figure>

## What it is

I wanted to digitise my records properly, and I wanted to understand a delta-sigma converter well enough to build one — not pick one out of a catalogue. **The Vinyl ADC is a stereo 24-bit / 48 kHz audio ADC with zero dedicated ADC ICs in it.** Each channel is a continuous-time, third-order, 1-bit delta-sigma modulator made from a quad op-amp, a comparator and a handful of 74HC gates. The two channels' 1.536 MHz bitstreams are interleaved onto one line and read by a Raspberry Pi as ordinary 48 kHz 32-bit stereo I2S — the most boring, best-supported mode the Pi has — and the decimation from PDM to PCM happens in software, ending in FLAC files on my media server.

Every board is a single-sided PCB milled on the Roland SRM-20 with [SRM-CAM](/projects/srm-cam), which makes this the first project where the whole fabrication chain I've built gets used end to end on something I actually want to own.

## The constraint that shaped everything

The plan was to build it from parts in the DTU component shop, so the first thing I did was read the shop's list — 1,464 lines, the same list the KiCad libraries are built from. The candidates from the original sketch mostly weren't there: no NE5532, no OPA2134, no crystal oscillators, no charge-pump IC, no precision voltage reference. The fastest op-amp on the shelf is an LF356 at 5 MHz; the only comparator worth using is an LM311 at 200 ns.

That one table reshaped the design. A 6.144 MHz modulator clock would need 25 MHz op-amps and a 50 ns comparator. With what's on the shelf the clock lands at **1.536 MHz — an oversampling ratio of 32 for 48 kHz out** — and at OSR 32 a second-order loop tops out at 53 dB. So the modulator became **third order**, which gets to 70 dB. The third integrator is the price of the shop's op-amp selection, and it's what the numbers said to pay.

## Architecture / approach

```
line in ──► Σ ──► ∫ ──► Σ ──► ∫ ──► Σ ──► ∫ ──► Σ ──► LM311 ──► 74HC74 ──► PDM out (1.536 MHz)
             ▲          ▲          ▲   ▲      ▲                    │
             │          │          │   └──────┘ resonator g       │
             └──────────┴──────────┴──────────────── 1-bit DAC (74HC04) ◄──┘
                                          k0 (excess-loop-delay compensation)
```

- **Modulator** — a cascade-of-integrators-feedback (CIFB) topology, continuous-time, with active-RC integrators on TL07x op-amps. A resonator path from the third integrator back to the second spreads the noise-transfer-function zeros across the audio band; it's worth 6.9 dB and costs one op-amp section that the quad package supplies for free.
- **Quantiser and DAC** — an LM311 clocked into a 74HC74 flip-flop; the 1-bit DAC is a 74HC04 gate swinging 0/5 V into a resistor, re-centred against a −2.5 V reference so the feedback is ±2.5 V.
- **Clock and interface** — a 6.144 MHz crystal oscillator can through a 74HC4040 ripple counter gives, off successive taps, the 3.072 MHz I2S bit clock, the 1.536 MHz modulator clock, a 192 kHz charge-pump drive and the 48 kHz word clock — one counter driving everything, so the L/R phase is fixed by construction. A 74HC157 interleaves the two channels onto the data line; a 74HC4049 level-shifts to the Pi's 3.3 V.
- **Supplies** — +5 V from the Pi, LC filtered. −5 V from a charge pump built from a 74HC244 with all eight outputs paralleled and two Schottkys, because the shop has no charge-pump IC. The pump is driven at 192 kHz deliberately: that is 4× the output rate, so any surviving ripple lands exactly on a null of the CIC decimator.
- **Boards** — four 100 × 100 mm single-sided boards from three artworks: power, one channel design milled twice, and digital. Stacked on standoffs, joined by 16-way ribbon, in a 3D-printed PETG base with a laser-engraved clear acrylic lid whose block diagram floats above the ICs it describes.

<figure>
  <div class="fig-row">
    <img src="/media/vinyl-adc/pcb-power-3d.jpg" alt="Raytraced render of the power board — 74HC244 charge pump, two Schottkys, electrolytic reservoirs, TL072 reference, ribbon header" width="1400" height="1050" />
    <img src="/media/vinyl-adc/pcb-digital-3d.jpg" alt="Raytraced render of the digital board — crystal oscillator can, 74HC4040 divider, 74HC157 mux, 74HC4049 level shifter, Pi header" width="1400" height="1050" />
  </div>
  <figcaption>The power board (left): charge pump, ±2.5 V reference, and the bulk reservoirs. The digital board (right): the oscillator can, the divider, the stereo interleave mux and the level shift to the Pi. Every IC is socketed; everything is through-hole so it can be milled single-sided.</figcaption>
</figure>

## What the simulations found

The circuit was designed in a numerical model first (`sim/`), then drawn in KiCad, then re-checked in eight ngspice testbenches generated from the same layout script as the board — so every bench is literally the same drawing. That order mattered, because each stage caught something the previous one couldn't.

**Excess loop delay, not gain-bandwidth, sets the clock.** I expected the 3 MHz TL07x to be the limit. It isn't: the loop is indifferent to op-amp GBW down to 1 MHz. What costs 7 dB and most of the overload margin is the LM311's 200 ns propagation delay — and at 3.072 MHz that same 200 ns is 61% of a clock period, which is unconditionally unstable. It's why the clock can't go faster, and it's also why the integrators are the 3 MHz TL074 and not the 5 MHz LF356: the faster part buys nothing. A single direct path from the DAC to the comparator input (`k0 = −0.225`) compensates the delay and recovers 8 dB.

**Without a clamp, one click on the record kills the recording.** A 40 µs transient at three times full scale — a scratch, a dropped stylus — leaves an unclamped third-order 1-bit loop **latched at one rail, permanently**. On a vinyl source that is not a corner case, it's Tuesday. The fix is free: the integrator state scaling is chosen so the op-amps' own output saturation is the clamp, and the loop recovers within a millisecond. The consequence is that the rail voltages and the resistor scaling are now load-bearing, not arbitrary — "tidying up" a value without re-running the verification script could make the converter un-recoverable again.

**The Pi interface in the original sketch could not work.** The plan was 64-bit stereo frames at the bit clock. Two independent problems: one data line can't carry two full-rate PDM streams, and the BCM2835 PCM block caps a channel at 32 bits, so most of each frame would simply never be captured. The fix fell out of the divider chain: run both modulators at 1.536 MHz, interleave at 3.072 MHz, and each standard 64-bit I2S frame carries exactly 32 L bits + 32 R bits — precisely one OSR-32 output sample per channel, frame-aligned for the decimator.

**Why the oscillator can is worth ordering.** The Pi's own clock output (GPCLK0) has about a nanosecond of jitter; the NRZ-DAC jitter floor that produces is 68 dB, which would eat the entire margin the third integrator was added to buy. A 20 ps crystal can puts that floor at 102 dB. It was the only part that genuinely had to be bought.

<figure>
  <img src="/media/vinyl-adc/noise-shaping-spectrum.png" alt="Top: a 1 kHz sine and the 1.536 MHz one-bit PDM stream that encodes it. Bottom: the simulated output spectrum on a log frequency axis — the 1 kHz tone at −6 dBFS, a flat audio band to 20 kHz, and quantisation noise rising at +60 dB/decade above it" width="1600" height="1011" />
  <figcaption>Simulated modulator output. Top: the analogue input and the 1-bit decision stream whose pulse density tracks it. Bottom: the noise-shaping spectrum — quantisation noise pushed out of the audio band at the third-order +60 dB/decade slope, for about 68 dB of SNR in the 20 kHz band with a −6 dBFS tone. The target was 65–75 dB, matched to the surface noise of the medium.</figcaption>
</figure>

**SPICE found the charge pump drawn backwards.** Both Schottkys had anode and cathode swapped, turning the inverter into a voltage doubler: the net called `−5V` simulated at **+3.4 V**, which would have arrived on the V− pin of every op-amp on the board. Nothing else caught it — the schematic scorer passed, ERC passed, the netlist read back correctly and my own topology checker passed, because a diode wired the wrong way round is still a connected diode and every one of those checks is about connectivity. The cause was a comment asserting that KiCad's `D_Schottky` numbers its pins anode-first. It numbers them cathode-first. The pump bench now asserts the output polarity explicitly — a check that could only ever have come from a simulation.

**The pump is weaker than the estimate, and that costs input headroom.** Simulated: −3.87 V at 30 mA, not the −4.1 V on paper. The output resistance is set by the 74HC244's own on-resistance, not by the flying capacitor, so a bigger cap or a faster clock changes nothing. On a −3.87 V rail the TL07x's *guaranteed* input common-mode floor is +0.13 V, and every virtual earth on the board sits at 0 V. It works — the summing nodes never go below −0.27 V, inside the typical range — but the volt of margin implied by writing "±5 V" is not there. That is why the LM311s run single-supply: lightening the negative rail buys margin directly.

**ngspice cannot read the board's component values.** `14k7`, `5k90`, `1M0` — correct IEC notation for a BOM — parse as 14 kΩ, 5 kΩ and **1 mΩ** in SPICE. Nothing warns; the deck exports and simulates a different circuit. Every passive now carries a second, SPICE-spelled value alongside the one the board and BOM use.

## Why four boards

The first layout was one board, 203 × 152 mm — the mill's whole envelope. Routed single-sided on the 0.8 mm end-mill process it came out at **45 hand-soldered wire bridges and 25 ground pads the pour could not reach**. That is not a board, it's a kit.

The reason is one number: **0.84 mm**. That is what a 2.54 mm DIP pitch leaves between two pads, and a track with milling clearance either side needs 2.7 mm. Nothing passes between adjacent DIP pins on this process, so every connection and the ground pour have to go round the outside of every package, and routability becomes a function of space per part. Splitting the digital section off routed cleanly at once. The analogue half stayed at 39–43 bridges however it was arranged, until the two channels went onto their own board — one artwork, milled twice, checked to be identical by a script that welds each ribbon's pin *n* to its partner's and requires the resulting netlist partition to match the single-sheet reference exactly. Move a block to the wrong board and every other check still passes; that one doesn't.

The modulator loop now crosses a ribbon — the comparator output leaves the channel board and the DAC drive comes back. That sounds alarming until you put a number on it: the delay `k0` compensates is the LM311's 200 ns, and 10 cm of ribbon adds 0.5 ns, a quarter of one percent.

<figure>
  <img src="/media/vinyl-adc/laser-engraved-lid.png" alt="Artwork for the laser-engraved acrylic lid: the block diagram of the converter — input, three integrators, comparator, clock, interleave, Pi — drawn so each block sits above the IC that implements it" width="530" height="530" />
  <figcaption>The engraving for the clear acrylic top. Seen through the lid, each block of the diagram sits directly above the chip that does the job.</figcaption>
</figure>

## Status

The design is complete and verified in simulation: 51 SPICE assertions and 34 model-vs-datasheet checks passing, a 120-build Monte Carlo showing SNR robust to 10% capacitors, and E96 resistor snapping costing nothing. The channel board's production Gerbers and drill files are exported for the mill, and the power and digital boards are laid out as fabricated. The stack is being milled, stuffed and brought up now. The honest expectation — recorded in the design notes before any measurement — is that the built board lands nearer 65 dB than 70, because the classic limiter of a continuous-time 1-bit DAC is rise/fall asymmetry in the gate, which the model doesn't include. That measurement is the next thing on this page.

## Tools & skills demonstrated

Delta-sigma modulator design from first principles (loop-filter synthesis, noise-transfer-function placement, excess-loop-delay compensation, overload and clamp analysis, jitter budgets); SPICE verification that found real bugs the connectivity checks passed; designing to a real parts list rather than an ideal one; I2S / PDM interface design against the BCM2835's actual constraints; single-sided PCB layout for a milling process, with a scripted gate that keeps a multi-board split honest; and a 3D-printed and laser-cut enclosure designed in Blender.
