// Interactive spectrogram for the Vinyl ADC page. Replaces the static SVG figure with a canvas drawn from the
// same data (a grayscale PNG of dB values + a JSON of axes, detected harmonic bands and detected onsets), adds
// a playhead synced to the <audio> excerpt (same 24 s), click-to-seek, and a hover readout of time, frequency,
// level, musical note and what the feature under the cursor is. The static SVG stays as the no-JS fallback.
(() => {
  const img = document.querySelector('img[src*="music-spectrogram.svg"]');
  if (!img) return;
  const figure = img.closest('figure'); const audio = document.querySelector('figure audio');
  const BASE = '/media/vinyl-adc/';
  const LEFT = '#3987e5', SURF = '#151312', INK = '#ffffff', INK2 = '#c3c2b7', MUTED = '#8f8888', GRID = 'rgba(255,255,255,0.09)';
  const W = 900, H = 470, X0 = 66, X1 = 812, Y0 = 78, Y1 = 388; // 82 px right of the plot for the widest note label
  const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  const noteName = f => { const m = Math.round(69 + 12 * Math.log2(f / 440)); return NOTES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); };
  const ramp = v => { // same single-hue ramp as the figures
    const S = [[0x15,0x13,0x12],[0x1b,0x3a,0x6a],[0x39,0x87,0xe5],[0xa9,0xcd,0xf5],[0xff,0xff,0xff]], P = [0, .45, .74, .91, 1];
    v = Math.min(1, Math.max(0, v)); let k = 0; while (k < 3 && v > P[k + 1]) k++;
    const t = (v - P[k]) / (P[k + 1] - P[k]); return S[k].map((c, i) => Math.round(c + (S[k + 1][i] - c) * t));
  };

  Promise.all([
    fetch(BASE + 'music-spectrogram-data.json').then(r => r.json()),
    new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = BASE + 'music-spectrogram-data.png'; }),
  ]).then(([meta, dataImg]) => build(meta, dataImg)).catch(() => {});

  function build(meta, dataImg) {
    // colourise the data image once
    const off = document.createElement('canvas'); off.width = dataImg.width; off.height = dataImg.height;
    const oc = off.getContext('2d'); oc.drawImage(dataImg, 0, 0);
    const px = oc.getImageData(0, 0, off.width, off.height); const d = px.data; const lut = [];
    for (let v = 0; v < 256; v++) lut.push(ramp(v / 255));
    for (let i = 0; i < d.length; i += 4) { const c = lut[d[i]]; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; }
    oc.putImageData(px, 0, 0);
    const grey = off; // the colourised canvas (drawImage wants the canvas, not its context)
    // and the original values, kept for the readouts
    const raw = document.createElement('canvas'); raw.width = dataImg.width; raw.height = dataImg.height;
    raw.getContext('2d').drawImage(dataImg, 0, 0); const rawData = raw.getContext('2d').getImageData(0, 0, raw.width, raw.height).data;

    // swap the static figure body for the canvas, keep the caption
    const wrap = figure.querySelector('div'); const cap = figure.querySelector('figcaption');
    const holder = document.createElement('div'); holder.style.cssText = 'overflow-x:auto';
    holder.innerHTML = `<div style="position:relative;min-width:680px;max-width:900px">
      <canvas style="width:100%;height:auto;display:block;border-radius:8px;cursor:crosshair" role="img"
        aria-label="Interactive spectrogram of the excerpt: hover for time, frequency, level and note; click to play from there"></canvas>
      <div data-tip style="position:absolute;display:none;pointer-events:none;background:#0f0f0e;border:1px solid #33332f;border-radius:8px;padding:7px 10px;font:12.5px ui-monospace,SFMono-Regular,Menlo,monospace;color:${INK2};line-height:1.45;max-width:300px"></div>
    </div>`;
    wrap.replaceWith(holder);
    const canvas = holder.querySelector('canvas'), tip = holder.querySelector('[data-tip]');
    const extra = document.createElement('span'); extra.textContent = ' Hover the picture to read time, frequency, level and note at any point; click to hear it from there. The instrument attributions are my reading of the features, not a detector.';
    if (cap) cap.appendChild(extra);

    const secs = meta.seconds, lf0 = Math.log10(meta.fmin), lf1 = Math.log10(meta.fmax);
    const tx = t => X0 + t / secs * (X1 - X0), fy = f => Y1 - (Math.log10(f) - lf0) / (lf1 - lf0) * (Y1 - Y0);
    const xt = x => (x - X0) / (X1 - X0) * secs, yf = y => Math.pow(10, lf0 + (Y1 - y) / (Y1 - Y0) * (lf1 - lf0));
    const bands = meta.bands || [], onsets = meta.onsets || [];
    let hover = null, dpr = 1;

    function draw() {
      dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr; canvas.height = H * dpr; const c = canvas.getContext('2d'); c.scale(dpr, dpr);
      c.fillStyle = SURF; c.fillRect(0, 0, W, H);
      c.fillStyle = INK; c.font = '600 17px system-ui,sans-serif'; c.fillText('Twenty-four seconds of a record, through the converter', 18, 26);
      c.fillStyle = MUTED; c.font = '14px system-ui,sans-serif'; c.fillText('Everything in Its Right Place, 2:05 to 2:29, left channel of the ripper’s 48 kHz output. Level per 2048-point FFT bin.', 18, 45);
      c.imageSmoothingEnabled = true; c.drawImage(grey, X0, Y0, X1 - X0, Y1 - Y0);
      // axes
      c.font = '12.5px ui-monospace,SFMono-Regular,Menlo,monospace'; c.fillStyle = MUTED; c.strokeStyle = MUTED; c.lineWidth = 1;
      for (const [f, lab] of [[50,'50'],[100,'100'],[200,'200'],[500,'500'],[1000,'1k'],[2000,'2k'],[5000,'5k'],[10000,'10k'],[20000,'20k']]) {
        const y = fy(f); c.beginPath(); c.moveTo(X0 - 4, y); c.lineTo(X0, y); c.stroke(); c.textAlign = 'right'; c.fillText(lab, X0 - 8, y + 4);
      }
      for (let t = 0; t <= secs; t += 4) { const x = tx(t); c.beginPath(); c.moveTo(x, Y1); c.lineTo(x, Y1 + 4); c.stroke(); c.textAlign = 'center'; c.fillText(t + ' s', x, Y1 + 18); }
      c.textAlign = 'right'; c.fillText('Hz', X0 - 8, Y0 - 8);
      // detected bands: guide lines with note names, brighter when hovered nearby
      for (const b of bands) {
        const y = fy(b.hz), near = hover && Math.abs(Math.log2(hover.f / b.hz)) < 0.06;
        c.strokeStyle = near ? INK : 'rgba(255,255,255,0.35)'; c.setLineDash(near ? [] : [3, 4]); c.lineWidth = near ? 1.2 : 0.8;
        c.beginPath(); c.moveTo(X0, y); c.lineTo(X1, y); c.stroke(); c.setLineDash([]);
        c.fillStyle = near ? INK : INK2; c.textAlign = 'left'; c.font = (near ? '600 ' : '') + '12px system-ui,sans-serif';
        c.fillText(`${b.note} · ${Math.round(b.hz)} Hz`, X1 + 6, y + 4);
      }
      // onsets: ticks above the plot
      c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 1;
      for (const t of onsets) { const x = tx(t); c.beginPath(); c.moveTo(x, Y0 - 10); c.lineTo(x, Y0 - 2); c.stroke(); }
      c.fillStyle = MUTED; c.font = '12px system-ui,sans-serif'; c.textAlign = 'right'; c.fillText(`${onsets.length} detected hits`, X1, Y0 - 14);
      // colour key, above the plot on the left, where nothing else needs the room
      const kx = X0 + 34, ky = 55; const g = c.createLinearGradient(kx, 0, kx + 160, 0);
      for (let i = 0; i <= 8; i++) { const col = ramp(i / 8); g.addColorStop(i / 8, `rgb(${col[0]},${col[1]},${col[2]})`); }
      c.fillStyle = g; c.fillRect(kx, ky, 160, 8);
      c.fillStyle = MUTED; c.font = '12.5px ui-monospace,monospace'; c.textAlign = 'right'; c.fillText(meta.db_lo, kx - 6, ky + 8); c.textAlign = 'left'; c.fillText(meta.db_hi + ' dBFS', kx + 166, ky + 8);
      // playhead
      if (audio && audio.currentTime > 0) {
        const x = tx(Math.min(secs, audio.currentTime)); c.strokeStyle = LEFT; c.lineWidth = 2; c.beginPath(); c.moveTo(x, Y0); c.lineTo(x, Y1); c.stroke();
        c.fillStyle = LEFT; c.beginPath(); c.moveTo(x - 6, Y0 - 1); c.lineTo(x + 6, Y0 - 1); c.lineTo(x, Y0 + 7); c.closePath(); c.fill();
      }
      // hover crosshair
      if (hover) { c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(hover.x, Y0); c.lineTo(hover.x, Y1); c.moveTo(X0, hover.y); c.lineTo(X1, hover.y); c.stroke(); c.setLineDash([]); }
      // notes
      c.fillStyle = INK2; c.font = '13px system-ui,sans-serif'; c.textAlign = 'left';
      c.fillText('Horizontal bands are sustained notes: C and D♭, the two chords the song alternates between. Ticks above are drum hits.', 18, H - 34);
      c.fillStyle = MUTED; c.fillText(audio ? 'Click anywhere on the picture to play from that moment; the blue line follows the audio.' : 'Hover for the reading at any point.', 18, H - 14);
    }

    function describe(t, f, db) {
      const band = bands.find(b => Math.abs(Math.log2(f / b.hz)) < 0.06);
      const hit = onsets.find(o => Math.abs(o - t) < 0.08);
      const lines = [];
      if (band) lines.push(`sustained band at ${Math.round(band.hz)} Hz — ${band.note}: I read this as the electric piano’s chord${band.hz < 160 ? ' and its bass' : ''}`);
      if (hit && f > 1500) lines.push('percussive onset — a drum hit, energy across the whole band for a few milliseconds');
      if (!band && f < 90) lines.push('the bass: sustained energy below 90 Hz');
      if (!band && !hit && f >= 90 && f < 1500) lines.push('the mid range: chord harmonics, and the voice where it is present');
      if (f >= 6000) lines.push(hit ? '' : 'the highs: cymbals and hi-hat, on top of the record’s own surface noise');
      return lines.filter(Boolean);
    }
    function level(t, f) {
      const col = Math.min(raw.width - 1, Math.max(0, Math.round(t / secs * (raw.width - 1))));
      const row = Math.min(raw.height - 1, Math.max(0, Math.round((1 - (Math.log10(f) - lf0) / (lf1 - lf0)) * (raw.height - 1))));
      return meta.db_lo + rawData[(row * raw.width + col) * 4] / 255 * (meta.db_hi - meta.db_lo);
    }
    function pos(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
    canvas.addEventListener('mousemove', e => {
      const p = pos(e);
      if (p.x < X0 || p.x > X1 || p.y < Y0 || p.y > Y1) { hover = null; tip.style.display = 'none'; draw(); return; }
      const t = xt(p.x), f = yf(p.y), db = level(t, f); hover = { x: p.x, y: p.y, t, f };
      const what = describe(t, f, db).map(s => `<div style="color:${INK}">${s}</div>`).join('');
      tip.innerHTML = `<b>${t.toFixed(2)} s</b> · <b>${f >= 1000 ? (f / 1000).toFixed(2) + ' kHz' : Math.round(f) + ' Hz'}</b> (${noteName(f)}) · ${db.toFixed(0)} dBFS${what}`;
      tip.style.display = 'block';
      const r = canvas.getBoundingClientRect(); const lx = e.clientX - r.left + 14, ly = e.clientY - r.top + 14;
      tip.style.left = Math.min(r.width - tip.offsetWidth - 6, lx) + 'px'; tip.style.top = Math.min(r.height - tip.offsetHeight - 6, ly) + 'px';
      draw();
    });
    canvas.addEventListener('mouseleave', () => { hover = null; tip.style.display = 'none'; draw(); });
    canvas.addEventListener('click', e => {
      if (!audio) return; const p = pos(e); if (p.x < X0 || p.x > X1) return;
      audio.currentTime = Math.max(0, Math.min(secs - 0.05, xt(p.x))); if (audio.paused) audio.play(); draw();
    });
    if (audio) {
      let raf = 0; const tick = () => { draw(); if (!audio.paused) raf = requestAnimationFrame(tick); };
      audio.addEventListener('play', () => { cancelAnimationFrame(raf); tick(); });
      audio.addEventListener('pause', draw); audio.addEventListener('seeked', draw); audio.addEventListener('ended', draw);
    }
    window.addEventListener('resize', draw);
    draw();
  }
})();
