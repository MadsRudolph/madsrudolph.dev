// Live analysis of the Vinyl ADC excerpt as it plays, drawn under the <audio> element on the project page.
// Web Audio taps the element (same-origin file, so no CORS dance), splits it into L and R, and two analysers
// feed one canvas: spectrum (L solid, R dashed), a level pair, and the L/R correlation - the reading that
// separates the mono fallback (+1.000) from a real stereo rip. Colours match the measurement figures.
(() => {
  const audio = document.querySelector('figure audio');
  if (!audio || !(window.AudioContext || window.webkitAudioContext)) return;

  const LEFT = '#3987e5', RIGHT = '#d95926', SURF = '#161614', GRID = 'rgba(255,255,255,0.09)', MUTED = '#8f8888', INK2 = '#c3c2b7';
  const FMIN = 20, FMAX = 20000;

  // ---- build the widget right after the player's figure
  const host = audio.closest('figure');
  const fig = document.createElement('figure');
  fig.innerHTML = `
    <div style="position:relative">
      <canvas width="900" height="300" style="width:100%;max-width:900px;height:auto;display:block;border-radius:8px;background:${SURF}"
        role="img" aria-label="Live spectrum and stereo correlation of the excerpt as it plays"></canvas>
      <div data-tip style="position:absolute;display:none;pointer-events:none;background:#0f0f0e;border:1px solid #33332f;border-radius:8px;padding:6px 9px;font:12px ui-monospace,monospace;color:${INK2};white-space:nowrap"></div>
    </div>
    <div data-readouts style="display:flex;flex-wrap:wrap;gap:6px 22px;margin-top:8px;font:13px ui-monospace,SFMono-Regular,Menlo,monospace;color:${INK2};font-variant-numeric:tabular-nums">
      <span><i style="display:inline-block;width:14px;height:3px;border-radius:2px;background:${LEFT};vertical-align:middle;margin-right:6px"></i>L <b data-l>—</b> dBFS</span>
      <span><i style="display:inline-block;width:14px;height:0;border-top:2px dashed ${RIGHT};vertical-align:middle;margin-right:6px"></i>R <b data-r>—</b> dBFS</span>
      <span>L/R correlation <b data-c>—</b> <span style="color:${MUTED}">(+1.000 is mono)</span></span>
    </div>
    <figcaption>Live, in your browser, from the audio as it plays: the spectrum of both channels and their correlation. Press play above. With this mono rip the two traces sit exactly on top of each other and the correlation reads +1.000; a stereo rip separates them.</figcaption>`;
  host.insertAdjacentElement('afterend', fig);
  const canvas = fig.querySelector('canvas'), tip = fig.querySelector('[data-tip]');
  const outL = fig.querySelector('[data-l]'), outR = fig.querySelector('[data-r]'), outC = fig.querySelector('[data-c]');

  // ---- audio graph, created on the first play (a user gesture, which Safari requires)
  let ctx = null, anL, anR, fL, fR, tL, tR, raf = 0;
  function setup() {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    const src = ctx.createMediaElementSource(audio);
    const split = ctx.createChannelSplitter(2);
    anL = ctx.createAnalyser(); anR = ctx.createAnalyser();
    for (const a of [anL, anR]) { a.fftSize = 4096; a.smoothingTimeConstant = 0.8; a.minDecibels = -110; a.maxDecibels = 0; }
    src.connect(split); split.connect(anL, 0); split.connect(anR, 1);
    src.connect(ctx.destination);
    fL = new Float32Array(anL.frequencyBinCount); fR = new Float32Array(anR.frequencyBinCount);
    tL = new Float32Array(anL.fftSize); tR = new Float32Array(anR.fftSize);
  }
  audio.addEventListener('play', () => { if (!ctx) setup(); ctx.resume(); loop(); });
  audio.addEventListener('pause', () => cancelAnimationFrame(raf));
  audio.addEventListener('ended', () => cancelAnimationFrame(raf));

  // ---- drawing
  const db = v => 20 * Math.log10(Math.max(v, 1e-9));
  const fx = (f, w) => (Math.log10(f) - Math.log10(FMIN)) / (Math.log10(FMAX) - Math.log10(FMIN)) * w;
  let geom = null;
  function frame(withData) {
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width = Math.round(canvas.clientWidth * dpr), H = canvas.height = Math.round(canvas.clientWidth * dpr / 3);
    const c = canvas.getContext('2d');
    c.fillStyle = SURF; c.fillRect(0, 0, W, H);
    const padL = 44 * dpr, padB = 22 * dpr, padT = 10 * dpr, pw = W - padL - 10 * dpr, ph = H - padT - padB;
    c.font = `${11 * dpr}px ui-monospace,monospace`; c.fillStyle = MUTED; c.strokeStyle = GRID; c.lineWidth = 1;
    for (const f of [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]) {
      const x = padL + fx(f, pw); c.beginPath(); c.moveTo(x, padT); c.lineTo(x, padT + ph); c.stroke();
      c.textAlign = 'center'; c.fillText(f >= 1000 ? f / 1000 + 'k' : f, x, H - 6 * dpr);
    }
    for (let d = -100; d <= 0; d += 20) {
      const y = padT + (-d / 110) * ph; c.beginPath(); c.moveTo(padL, y); c.lineTo(padL + pw, y); c.stroke();
      c.textAlign = 'right'; c.fillText(d, padL - 6 * dpr, y + 4 * dpr);
    }
    geom = { padL, pw, padT, ph, dpr };
    if (!withData) { c.textAlign = 'center'; c.fillStyle = MUTED; c.font = `${13 * dpr}px system-ui,sans-serif`; c.fillText('press play above', padL + pw / 2, padT + ph / 2); return; }
    const bins = fL.length, nyq = ctx.sampleRate / 2;
    const trace = (arr, colour, width, dash) => {
      c.beginPath(); c.strokeStyle = colour; c.lineWidth = width * dpr; c.setLineDash(dash); let on = false;
      for (let i = 1; i < bins; i++) { const f = i * nyq / bins; if (f < FMIN || f > FMAX) continue;
        const x = padL + fx(f, pw), y = padT + Math.min(1, Math.max(0, -arr[i] / 110)) * ph; on ? c.lineTo(x, y) : c.moveTo(x, y); on = true; }
      c.stroke(); c.setLineDash([]);
    };
    trace(fL, LEFT, 2, []); trace(fR, RIGHT, 1.7, [6 * dpr, 4 * dpr]);
  }
  function loop() {
    if (audio.paused) return;
    anL.getFloatFrequencyData(fL); anR.getFloatFrequencyData(fR);
    anL.getFloatTimeDomainData(tL); anR.getFloatTimeDomainData(tR);
    let sl = 0, sr = 0, slr = 0;
    for (let i = 0; i < tL.length; i++) { sl += tL[i] * tL[i]; sr += tR[i] * tR[i]; slr += tL[i] * tR[i]; }
    const n = tL.length, rl = Math.sqrt(sl / n), rr = Math.sqrt(sr / n);
    outL.textContent = rl > 1e-6 ? db(rl).toFixed(1) : '−∞'; outR.textContent = rr > 1e-6 ? db(rr).toFixed(1) : '−∞';
    const corr = sl > 1e-9 && sr > 1e-9 ? slr / Math.sqrt(sl * sr) : NaN;
    outC.textContent = isNaN(corr) ? '—' : (corr >= 0 ? '+' : '') + corr.toFixed(3);
    frame(true);
    raf = requestAnimationFrame(loop);
  }
  canvas.addEventListener('mousemove', e => {
    if (!geom || !fL) return; const r = canvas.getBoundingClientRect(); const x = (e.clientX - r.left) * geom.dpr;
    if (x < geom.padL || x > geom.padL + geom.pw) { tip.style.display = 'none'; return; }
    const f = Math.pow(10, Math.log10(FMIN) + (x - geom.padL) / geom.pw * (Math.log10(FMAX) - Math.log10(FMIN)));
    const bin = Math.round(f / (ctx.sampleRate / 2) * fL.length);
    tip.innerHTML = `<b>${f >= 1000 ? (f / 1000).toFixed(2) + ' kHz' : f.toFixed(0) + ' Hz'}</b><br>L ${fL[bin].toFixed(0)} dB · R ${fR[bin].toFixed(0)} dB`;
    tip.style.display = 'block'; tip.style.left = Math.min(r.width - tip.offsetWidth - 8, e.clientX - r.left + 12) + 'px'; tip.style.top = (e.clientY - r.top + 12) + 'px';
  });
  canvas.addEventListener('mouseleave', () => tip.style.display = 'none');
  window.addEventListener('resize', () => frame(!!fL && !audio.paused));
  frame(false);
})();
