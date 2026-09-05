---
title: 'REGBOT: balancing robot control'
summary: >-
  Four cascaded control loops keep a two-wheeled robot upright and drive it to a target, verified in simulation and on hardware.
date: 2026-04-22
tags: ['MATLAB', 'Simulink', 'Simscape Multibody', 'Control systems', 'System identification', 'Frequency-domain design']
repo: 'https://github.com/Skab101/REGBOT-Balance'
featured: true
order: 1.5
status: working
kind: coursework
hero: '/media/regbot/robot-hero.jpg'
heroAlt: 'The REGBOT two-wheeled self-balancing robot balancing upright on the lab floor'
---

Group project for DTU 34722. The work covered system identification, MATLAB/Simulink controller design, and physical robot tests.

<figure>
  <div class="video-frame">
    <iframe
      src="https://www.youtube-nocookie.com/embed/yzdvBDtpQd8"
      title="REGBOT self-balancing robot — balancing and driving demo"
      loading="lazy"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  </div>
  <figcaption>The controller running on the physical robot.</figcaption>
</figure>

## The challenge

Identifying the motors with the wheels off the floor produced the wrong plant model. Re-identifying on the floor and redesigning the loops made the inner-loop rise time **27× faster**.

## Results

- A **2 m** move finished **3.6 cm** short, without overshoot.
- Completed a square at **0.8 m/s** while balancing.
- All four loops met their design margins.

<figure>
  <img loading="lazy" src="/media/regbot/position-2m.png" alt="Measured 2 metre position-move response of the robot over time" width="1320" height="1320" />
  <figcaption>Measured response for the two-metre move.</figcaption>
</figure>

[Code, design files & full documentation →](https://github.com/Skab101/REGBOT-Balance)
