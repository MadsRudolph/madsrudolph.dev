// Interactive spectrogram for the Vinyl ADC page. Replaces the static SVG figure with a canvas drawn from the
// same data (docs/figures_music.py in the vinyl-adc repo): a grayscale PNG of the dB values, a PNG of which
// note is loudest at each moment, and a JSON with the axes, the passage's own average level per row, the
// detected bands with their notes, the detected hits, and the moment where each kind of thing is clearest.
//
// What it adds over the picture: a legend that isolates one kind of thing on hover and plays it on click; two
// contrast modes (what stands out against the usual level at that pitch, or the true level); a playhead synced
// to the <audio> excerpt with click-to-seek and drag-to-zoom on the time axis; a running line saying what is
// sounding; and a hover readout of time, frequency, level, note and what the feature under the cursor is.
// The static SVG stays as the no-JS fallback.
(() => {
  const img = document.querySelector('img[src*="music-spectrogram.svg"]');
  if (!img) return;
  const figure = img.closest('figure'); const audio = document.querySelector('figure audio');
  const BASE = '/media/vinyl-adc/', V = '?v=3';   // bump with the data files: the site caches them for hours
  const LEFT = '#3987e5', SURF = '#151312', INK = '#ffffff', INK2 = '#c3c2b7', MUTED = '#8f8888', LINE = '#3a3935';
  // layout shared with the SVG: the plot, a lane for the loudest note, a lane for the beat, one time axis
  const W = 900, H = 524, X0 = 66, X1 = 812, Y0 = 78, Y1 = 314, CY0 = 330, CY1 = 450, HY0 = 464, HY1 = 494;
  const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  const FLAT = { 'C♯': 'D♭', 'D♯': 'E♭', 'F♯': 'G♭', 'G♯': 'A♭', 'A♯': 'B♭' };
  const nm = k => NOTES[k] + (FLAT[NOTES[k]] ? '/' + FLAT[NOTES[k]] : '');
  const noteName = f => { const m = Math.round(69 + 12 * Math.log2(f / 440)); return NOTES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); };
  const fmtF = f => f >= 1000 ? (f / 1000).toFixed(2) + ' kHz' : Math.round(f) + ' Hz';
  const signed = v => (v > 0 ? '+' : '') + v;
  const ramp = v => { // the same single-hue ramp as the figures
    const S = [[0x15,0x13,0x12],[0x1b,0x3a,0x6a],[0x39,0x87,0xe5],[0xa9,0xcd,0xf5],[0xff,0xff,0xff]], P = [0, .45, .74, .91, 1];
    v = Math.min(1, Math.max(0, v)); let k = 0; while (k < 3 && v > P[k + 1]) k++;
    const t = (v - P[k]) / (P[k + 1] - P[k]); return S[k].map((c, i) => Math.round(c + (S[k + 1][i] - c) * t));
  };
  const LUT = Array.from({ length: 256 }, (_, v) => ramp(v / 255));

  // the four kinds of thing in the picture: key, chip label, what the line under the picture says when you hover the chip
  const FEATURES = [
    ['bands', 'Chord tones', 'Chord tones — the keyboard. The horizontal bands, one per note; the lane below names the loudest one at each moment.'],
    ['hits', 'Beats', 'Beats — the percussive hits. A vertical stripe is energy at every frequency for a few milliseconds, and a spike in the beat lane.'],
    ['bass', 'Bass', 'Bass — everything under 90 Hz: the low notes and the weight of each hit.'],
    ['highs', 'Highs', 'Highs — above 6 kHz: the ticks of the percussion on top of the record’s own surface noise.'],
  ];
  const GLYPH = { bands: '<path d="M1 3h14M1 7h14M1 11h14"/>', hits: '<path d="M3 1v12M8 4v9M13 2v11"/>',
                  bass: '<path d="M1 12h14M1 9h14M1 6h6"/>', highs: '<path d="M1 2h14M3 6h1M7 6h1M11 6h1"/>' };
  const glyph = k => `<svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">${GLYPH[k]}</svg>`;
  const CHIP = `font:12.5px system-ui,sans-serif;color:${INK2};background:transparent;border:1px solid ${LINE};border-radius:999px;padding:6px 12px 6px 9px;display:inline-flex;align-items:center;gap:7px;cursor:pointer;line-height:1`;
  const SEG = `font:12px system-ui,sans-serif;color:${INK2};background:transparent;border:0;padding:7px 11px;cursor:pointer;line-height:1`;

  const loadImage = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  Promise.all([
    fetch(BASE + 'music-spectrogram-data.json' + V).then(r => r.json()),
    loadImage(BASE + 'music-spectrogram-data.png' + V),
    loadImage(BASE + 'music-spectrogram-chroma.png' + V),
  ]).then(([meta, dataImg, chromaImg]) => build(meta, dataImg, chromaImg)).catch(() => {});

  function pixels(im) {
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, im.width, im.height).data;
  }
  function colourise(vals, w, h, fn) { // fn(value 0..255, row) -> 0..1 on the ramp
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    const id = x.createImageData(w, h), d = id.data;
    for (let r = 0, i = 0; r < h; r++) for (let col = 0; col < w; col++, i++) {
      const k = LUT[Math.max(0, Math.min(255, Math.round(fn(vals[i * 4], r) * 255)))];
      d[i * 4] = k[0]; d[i * 4 + 1] = k[1]; d[i * 4 + 2] = k[2]; d[i * 4 + 3] = 255;
    }
    x.putImageData(id, 0, 0); return c;
  }

  function build(meta, dataImg, chromaImg) {
    const secs = meta.seconds, cols = dataImg.width, rows = dataImg.height, lf0 = Math.log10(meta.fmin), lf1 = Math.log10(meta.fmax);
    const bands = meta.bands || [], onsets = meta.onsets || [], flux = meta.flux || [], moments = meta.moments || {}, env = meta.env || [];
    const raw = pixels(dataImg), chromaRaw = pixels(chromaImg);
    const dbOf = v => meta.db_lo + v / 255 * (meta.db_hi - meta.db_lo);
    // the two views, colourised once: true level, and level against the passage's own average at that pitch
    const absC = colourise(raw, cols, rows, v => v / 255);
    const relC = colourise(raw, cols, rows, (v, r) => (dbOf(v) - env[r] - meta.rel_lo) / (meta.rel_hi - meta.rel_lo));
    const chromaC = colourise(chromaRaw, cols, 12, v => v / 255);
    // readouts, from the raw values
    const rowOf = f => Math.min(rows - 1, Math.max(0, Math.round((1 - (Math.log10(f) - lf0) / (lf1 - lf0)) * (rows - 1))));
    const colOf = t => Math.min(cols - 1, Math.max(0, Math.round(t / meta.hop_s)));   // columns are one hop apart, not secs/cols
    const absDb = (t, f) => dbOf(raw[(rowOf(f) * cols + colOf(t)) * 4]);
    const relDb = (t, f) => absDb(t, f) - env[rowOf(f)];
    const chromaAt = (t, k) => chromaRaw[((11 - k) * cols + colOf(t)) * 4] / 255;   // PNG rows run B (top) to C (bottom)
    const bandOn = (t, b) => relDb(t, b.hz) > 6;

    // ---- swap the static figure body for the widget, keep the caption
    const wrap = figure.querySelector('div'), cap = figure.querySelector('figcaption');
    const holder = document.createElement('div');
    holder.innerHTML = `
      <div data-chips style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 8px">
        ${FEATURES.map(([k, l]) => `<button type="button" data-feature="${k}" aria-pressed="false" style="${CHIP}">${glyph(k)}<span>${l}${k === 'bands' ? ` · ${bands.length}` : k === 'hits' ? ` · ${onsets.length}` : ''}</span></button>`).join('')}
        <span style="margin-left:auto;display:inline-flex;border:1px solid ${LINE};border-radius:999px;overflow:hidden" role="group" aria-label="Contrast">
          <button type="button" data-mode="rel" aria-pressed="true" style="${SEG}">What stands out</button>
          <button type="button" data-mode="abs" aria-pressed="false" style="${SEG}">True level</button>
        </span>
        <button type="button" data-zoomout style="${CHIP};display:none">Show all ${Math.round(secs)} s</button>
      </div>
      <div style="overflow-x:auto"><div style="position:relative;min-width:680px;max-width:900px">
        <canvas style="width:100%;height:auto;display:block;border-radius:8px;cursor:crosshair;touch-action:pan-y" role="img"
          aria-label="Interactive spectrogram of the excerpt with a loudest-note lane and a beat lane: hover for time, frequency, level and note; click to play from there; drag to zoom"></canvas>
        <div data-tip style="position:absolute;display:none;pointer-events:none;background:#0f0f0e;border:1px solid #33332f;border-radius:8px;padding:7px 10px;font:12.5px ui-monospace,SFMono-Regular,Menlo,monospace;color:${INK2};line-height:1.45;max-width:320px"></div>
      </div></div>
      <div data-now style="margin-top:8px;font:13px ui-monospace,SFMono-Regular,Menlo,monospace;color:${INK2};min-height:1.5em"></div>`;
    wrap.replaceWith(holder);
    const canvas = holder.querySelector('canvas'), tip = holder.querySelector('[data-tip]'), now = holder.querySelector('[data-now]');
    const chips = [...holder.querySelectorAll('[data-feature]')], modes = [...holder.querySelectorAll('[data-mode]')], zoomOut = holder.querySelector('[data-zoomout]');
    const idleText = audio ? `<span style="color:${MUTED}">Press play, or click a legend entry, and this line says what is sounding.</span>` : '';
    now.innerHTML = idleText;
    if (cap) { const extra = document.createElement('span'); extra.textContent = ' Hover the picture to read any point; hover a legend entry to see only that kind of thing, click it to hear it; drag across the time axis to zoom in, double-click to zoom out. The instrument attributions are my reading of the features, not a detector.'; cap.appendChild(extra); }

    // ---- state and mappings
    let view = { t0: 0, t1: secs }, mode = 'rel', focus = null, pinned = null, hover = null, drag = null;
    const span = () => view.t1 - view.t0, zoomed = () => view.t0 > 0 || view.t1 < secs;
    const setView = (t0, t1) => { view = { t0, t1 }; zoomOut.style.display = zoomed() ? 'inline-flex' : 'none'; };
    const tx = t => X0 + (t - view.t0) / span() * (X1 - X0), xt = x => view.t0 + (x - X0) / (X1 - X0) * span();
    const fy = f => Y1 - (Math.log10(f) - lf0) / (lf1 - lf0) * (Y1 - Y0), yf = y => Math.pow(10, lf0 + (Y1 - y) / (Y1 - Y0) * (lf1 - lf0));
    const featureText = Object.fromEntries(FEATURES.map(([k, , text]) => [k, text]));

    function featureRects(kind) { // where that kind of thing lives in the plot, in canvas units
      const R = [];
      if (kind === 'bands') for (const b of bands) { const y = fy(b.hz * 1.045); R.push([X0, y, X1 - X0, fy(b.hz / 1.045) - y]); }
      if (kind === 'hits') for (const o of onsets) { const a = Math.max(X0, tx(o - 0.03)), b = Math.min(X1, tx(o + 0.12)); if (b > a) R.push([a, Y0, b - a, Y1 - Y0]); }
      if (kind === 'bass') { const y = fy(90); R.push([X0, y, X1 - X0, Y1 - y]); }
      if (kind === 'highs') R.push([X0, Y0, X1 - X0, fy(6000) - Y0]);
      return R;
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr; canvas.height = H * dpr; const c = canvas.getContext('2d'); c.scale(dpr, dpr);
      c.fillStyle = SURF; c.fillRect(0, 0, W, H);
      c.fillStyle = INK; c.font = '600 17px system-ui,sans-serif'; c.textAlign = 'left'; c.fillText('Twenty-four seconds of a record, through the converter', 18, 26);
      c.fillStyle = MUTED; c.font = '14px system-ui,sans-serif'; c.fillText('Everything in Its Right Place, 2:05 to 2:29, left channel of the ripper’s 48 kHz output.', 18, 45);
      // the picture, in the view; dimmed to the isolated feature when a legend entry is hovered or pinned
      const src = mode === 'rel' ? relC : absC, sx = view.t0 / meta.hop_s, sw = span() / meta.hop_s;
      const plot = () => c.drawImage(src, sx, 0, sw, rows, X0, Y0, X1 - X0, Y1 - Y0);
      c.imageSmoothingEnabled = true; plot();
      const iso = focus || pinned;
      if (iso) {
        c.fillStyle = 'rgba(21,19,18,0.8)'; c.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
        c.save(); c.beginPath(); for (const [x, y, w, h] of featureRects(iso)) c.rect(x, y, w, h); c.clip(); plot(); c.restore();
      }
      // the lanes: which note is loudest, and the beat
      c.imageSmoothingEnabled = false; c.drawImage(chromaC, sx, 0, sw, 12, X0, CY0, X1 - X0, CY1 - CY0); c.imageSmoothingEnabled = true;
      c.fillStyle = LEFT; c.globalAlpha = 0.85; c.beginPath(); c.moveTo(X0, HY1);
      const k0 = Math.max(0, Math.floor(sx)), k1 = Math.min(flux.length - 1, Math.ceil(sx + sw));
      for (let k = k0; k <= k1; k++) c.lineTo(Math.max(X0, Math.min(X1, tx(k * meta.hop_s))), HY1 - flux[k] * (HY1 - HY0));
      c.lineTo(X1, HY1); c.closePath(); c.fill(); c.globalAlpha = 1;
      if (iso === 'bands' || iso === 'hits') { const [a, b] = iso === 'bands' ? [CY0, CY1] : [HY0, HY1]; c.strokeStyle = LEFT; c.lineWidth = 1.5; c.strokeRect(X0 - 1, a - 1, X1 - X0 + 2, b - a + 2); }
      // axes
      c.font = '12.5px ui-monospace,SFMono-Regular,Menlo,monospace'; c.fillStyle = MUTED; c.strokeStyle = MUTED; c.lineWidth = 1;
      for (const [f, lab] of [[50,'50'],[100,'100'],[200,'200'],[500,'500'],[1000,'1k'],[2000,'2k'],[5000,'5k'],[10000,'10k'],[20000,'20k']]) {
        const y = fy(f); c.beginPath(); c.moveTo(X0 - 4, y); c.lineTo(X0, y); c.stroke(); c.textAlign = 'right'; c.fillText(lab, X0 - 8, y + 4);
      }
      c.textAlign = 'right'; c.fillText('Hz', X0 - 8, Y0 - 8);
      const step = span() > 12 ? 4 : span() > 6 ? 2 : span() > 3 ? 1 : span() > 1.5 ? 0.5 : 0.2;
      for (let t = Math.ceil(view.t0 / step - 1e-9) * step; t <= view.t1 + 1e-9; t += step) {
        const x = tx(t); c.beginPath(); c.moveTo(x, HY1); c.lineTo(x, HY1 + 4); c.stroke(); c.textAlign = 'center'; c.fillText(t.toFixed(step < 1 ? 1 : 0) + ' s', x, HY1 + 18);
      }
      c.font = '11px system-ui,sans-serif'; c.textAlign = 'left'; c.fillStyle = MUTED; c.fillText('loudest note', X0, CY0 - 5); c.fillText('beat activity', X0, HY0 - 5);
      c.font = '10.5px ui-monospace,SFMono-Regular,Menlo,monospace'; c.textAlign = 'right';
      for (let r = 0; r < 12; r++) c.fillText(NOTES[11 - r], X0 - 8, CY0 + (r + 0.5) * (CY1 - CY0) / 12 + 3.5);
      // the bands: guide lines with their notes, brighter when the cursor is on one
      for (const b of bands) {
        const y = fy(b.hz), near = hover && hover.lane === 'plot' && Math.abs(Math.log2(hover.f / b.hz)) < 0.06;
        c.strokeStyle = near ? INK : 'rgba(255,255,255,0.35)'; c.setLineDash(near ? [] : [3, 4]); c.lineWidth = near ? 1.2 : 0.8;
        c.beginPath(); c.moveTo(X0, y); c.lineTo(X1, y); c.stroke(); c.setLineDash([]);
        c.fillStyle = near ? INK : INK2; c.textAlign = 'left'; c.font = (near ? '600 ' : '') + '12px system-ui,sans-serif';
        c.fillText(`${b.note} · ${Math.round(b.hz)} Hz`, X1 + 6, y + 4);
      }
      // the hits: ticks above the plot
      c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 1;
      for (const o of onsets) if (o >= view.t0 && o <= view.t1) { const x = tx(o); c.beginPath(); c.moveTo(x, Y0 - 10); c.lineTo(x, Y0 - 2); c.stroke(); }
      c.fillStyle = MUTED; c.font = '12px system-ui,sans-serif'; c.textAlign = 'right'; c.fillText(`${onsets.length} hits detected`, X1, Y0 - 14);
      // what is what, written on the picture
      c.font = '600 11.5px system-ui,sans-serif'; c.textAlign = 'left'; c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = SURF;
      for (const [k, f, text] of [['highs', 11000, 'highs · percussion ticks and the record’s surface noise'], ['hits', 3200, 'beats · vertical stripes'], ['bands', 380, 'chord tones · horizontal bands'], ['bass', 38, 'bass']]) {
        const on = !iso || iso === k; c.globalAlpha = on ? 1 : 0.35; c.strokeText(text, X0 + 8, fy(f) + 4); c.fillStyle = on ? INK : INK2; c.fillText(text, X0 + 8, fy(f) + 4);
      }
      c.globalAlpha = 1;
      // playhead through the plot and both lanes
      if (audio && audio.currentTime > 0) {
        const t = Math.min(secs, audio.currentTime);
        if (t >= view.t0 && t <= view.t1) {
          const x = tx(t); c.strokeStyle = LEFT; c.lineWidth = 2; c.beginPath(); c.moveTo(x, Y0); c.lineTo(x, HY1); c.stroke();
          c.fillStyle = LEFT; c.beginPath(); c.moveTo(x - 6, Y0 - 1); c.lineTo(x + 6, Y0 - 1); c.lineTo(x, Y0 + 7); c.closePath(); c.fill();
        }
      }
      // a zoom being dragged out
      if (drag && !drag.touch && Math.abs(drag.x - drag.x0) > 3) {
        const a = Math.min(drag.x, drag.x0), w = Math.abs(drag.x - drag.x0);
        c.fillStyle = 'rgba(57,135,229,0.18)'; c.fillRect(a, Y0, w, HY1 - Y0); c.strokeStyle = LEFT; c.lineWidth = 1; c.strokeRect(a + 0.5, Y0 + 0.5, w - 1, HY1 - Y0 - 1);
      }
      // hover crosshair: the time through everything, the level line only where it means something
      if (hover) {
        c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1; c.setLineDash([4, 4]); c.beginPath();
        c.moveTo(hover.x, Y0); c.lineTo(hover.x, HY1); if (hover.lane !== 'hits') { c.moveTo(X0, hover.y); c.lineTo(X1, hover.y); } c.stroke(); c.setLineDash([]);
      }
      // colour key, above the plot on the left
      const kx = X0 + 34, ky = 55, kw = 160; const g = c.createLinearGradient(kx, 0, kx + kw, 0);
      for (let i = 0; i <= 8; i++) { const col = ramp(i / 8); g.addColorStop(i / 8, `rgb(${col[0]},${col[1]},${col[2]})`); }
      c.fillStyle = g; c.fillRect(kx, ky, kw, 8);
      c.fillStyle = MUTED; c.font = '12.5px ui-monospace,SFMono-Regular,Menlo,monospace'; c.textAlign = 'right';
      if (mode === 'rel') { c.fillText(signed(meta.rel_lo), kx - 6, ky + 8); c.textAlign = 'left'; c.fillText(signed(meta.rel_hi) + ' dB against the usual level at that pitch', kx + kw + 6, ky + 8); }
      else { c.fillText(meta.db_lo, kx - 6, ky + 8); c.textAlign = 'left'; c.fillText(meta.db_hi + ' dBFS per FFT bin', kx + kw + 6, ky + 8); }
    }

    // ---- what the cursor is on
    function describe(t, f) {
      const band = bands.find(b => Math.abs(Math.log2(f / b.hz)) < 0.06), on = band && bandOn(t, band);
      const hit = onsets.find(o => t - o > -0.03 && t - o < 0.12);
      const L = [];
      if (on) L.push(`a sustained note, ${band.note} (${Math.round(band.hz)} Hz): a chord tone of the keyboard`);
      else if (band) L.push(`${band.note} runs along here, but it is quiet at this moment`);
      if (hit && f > 1500) L.push('a beat: the vertical stripe is a percussive hit, energy at every frequency for a few milliseconds');
      if (!band && f < 90) L.push(hit ? 'the bass, with a hit landing on it' : 'the bass: sustained energy under 90 Hz');
      if (!band && f >= 90 && f < 1500) L.push(hit ? 'the mid range as a hit lands: the chord’s harmonics under the beat' : 'the mid range: the chord’s harmonics, and the voice where it sings');
      if (!hit && f >= 1500 && f < 6000) L.push('between the chords and the highs: upper harmonics, and where each beat leaves its stripe');
      if (f >= 6000 && !hit) L.push('the highs: percussion ticks on top of the record’s own surface noise');
      return L;
    }
    function loudest(t) { // pitch classes at this moment: strongest and runner-up, with their shares
      let top = 0, second = 0, v1 = -1, v2 = -1;
      for (let k = 0; k < 12; k++) { const v = chromaAt(t, k); if (v > v1) { second = top; v2 = v1; top = k; v1 = v; } else if (v > v2) { second = k; v2 = v; } }
      return { top, second, v1, v2 };
    }
    function tipHTML(p) {
      const t = p.t, head = `<b>${t.toFixed(2)} s</b>`;
      if (p.lane === 'plot') {
        const a = absDb(t, p.f), r = relDb(t, p.f);
        return `${head} · <b>${fmtF(p.f)}</b> (${noteName(p.f)}) · ${a.toFixed(0)} dBFS, ${signed(Math.round(r))} dB against usual` +
          describe(t, p.f).map(s => `<div style="color:${INK}">${s}</div>`).join('');
      }
      if (p.lane === 'chroma') {
        const k = 11 - Math.min(11, Math.max(0, Math.floor((p.y - CY0) / ((CY1 - CY0) / 12)))), v = chromaAt(t, k), L = loudest(t);
        const what = L.v1 < 0.25 ? 'quiet here' : v >= 0.995 ? 'the loudest note at this moment' : v > 0.2 ? `${Math.round(v * 100)} % of the loudest note, ${nm(L.top)}` : `not sounding; the loudest note is ${nm(L.top)}`;
        return `${head} · <b>${nm(k)}</b><div style="color:${INK}">${what}</div>`;
      }
      return `${head} · beat activity ${Math.round((flux[colOf(t)] || 0) * 100)} %<div style="color:${INK}">new energy arriving between 2 and 8 kHz from one 21 ms column to the next; the spikes are the hits</div>`;
    }
    function nowText(t) {
      const L = loudest(t), on = bands.filter(b => bandOn(t, b)).map(b => b.note), hit = onsets.some(o => t - o >= 0 && t - o < 0.15);
      const parts = [`<b>${t.toFixed(1)} s</b>`];
      parts.push(L.v1 < 0.25 ? 'quiet' : `loudest note <b>${nm(L.top)}</b>` + (L.v2 > 0.5 ? `, then ${nm(L.second)}` : ''));
      if (on.length) parts.push(`chord tones sounding: ${on.join(', ')}`);
      if (hit) parts.push('<b>beat</b>');
      return parts.join(' · ');
    }

    // ---- the legend: hover isolates, click pins and plays the clearest moment
    function paint() {
      for (const b of chips) { const k = b.dataset.feature, on = pinned === k, hot = focus === k; b.setAttribute('aria-pressed', on); b.style.background = on ? 'rgba(57,135,229,0.16)' : 'transparent'; b.style.borderColor = on || hot ? LEFT : LINE; b.style.color = on || hot ? INK : INK2; }
      for (const b of modes) { const on = b.dataset.mode === mode; b.setAttribute('aria-pressed', on); b.style.background = on ? 'rgba(255,255,255,0.1)' : 'transparent'; b.style.color = on ? INK : INK2; }
    }
    const playing = () => audio && !audio.paused;
    for (const b of chips) {
      const k = b.dataset.feature;
      const show = () => { focus = k; if (!playing()) now.innerHTML = featureText[k] + (audio ? ` <span style="color:${MUTED}">Click to hear it.</span>` : ''); paint(); draw(); };
      const hide = () => { focus = null; if (!playing()) now.innerHTML = pinned ? featureText[pinned] : idleText; paint(); draw(); };
      b.addEventListener('mouseenter', show); b.addEventListener('mouseleave', hide); b.addEventListener('focus', show); b.addEventListener('blur', hide);
      b.addEventListener('click', () => {
        pinned = pinned === k ? null : k; paint(); draw();
        if (pinned && audio) { const at = moments[k] || 0; audio.currentTime = Math.max(0, at - (k === 'hits' ? 0.25 : 0.5)); audio.play().catch(() => {}); }
      });
    }
    for (const b of modes) b.addEventListener('click', () => { mode = b.dataset.mode; paint(); draw(); });
    zoomOut.addEventListener('click', () => { setView(0, secs); draw(); });
    paint();

    // ---- the picture: hover reads, click seeks, drag zooms, double-click zooms out
    const pos = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };
    const laneOf = p => p.x < X0 || p.x > X1 ? null : p.y >= Y0 && p.y <= Y1 ? 'plot' : p.y >= CY0 && p.y <= CY1 ? 'chroma' : p.y >= HY0 && p.y <= HY1 ? 'hits' : null;
    canvas.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return; const p = pos(e); if (!laneOf(p)) return;
      drag = { x0: p.x, x: p.x, touch: e.pointerType === 'touch' }; if (!drag.touch) canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      const p = pos(e);
      if (drag) { if (!drag.touch) { drag.x = Math.max(X0, Math.min(X1, p.x)); draw(); } return; }
      const lane = laneOf(p);
      if (!lane) { hover = null; tip.style.display = 'none'; draw(); return; }
      hover = { x: p.x, y: p.y, t: xt(p.x), f: yf(p.y), lane };
      tip.innerHTML = tipHTML(hover); tip.style.display = 'block';
      const r = canvas.getBoundingClientRect(), lx = e.clientX - r.left + 14, ly = e.clientY - r.top + 14;
      tip.style.left = Math.max(0, Math.min(r.width - tip.offsetWidth - 6, lx)) + 'px'; tip.style.top = Math.min(r.height - tip.offsetHeight - 6, ly) + 'px';
      draw();
    });
    const endDrag = e => {
      if (!drag) return; const d = drag; drag = null; const p = pos(e); const dx = (d.touch ? p.x : d.x) - d.x0;
      if (!d.touch && Math.abs(dx) > 6) {
        let a = xt(Math.min(d.x0, d.x)), b = xt(Math.max(d.x0, d.x));
        if (b - a < 0.5) { const m = (a + b) / 2; a = Math.max(0, m - 0.25); b = Math.min(secs, a + 0.5); }
        setView(a, b);
      } else if (audio && Math.abs(dx) <= 10) {
        audio.currentTime = Math.max(0, Math.min(secs - 0.05, xt(d.x0))); if (audio.paused) audio.play().catch(() => {});
      }
      draw();
    };
    canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', () => { drag = null; draw(); });
    canvas.addEventListener('pointerleave', () => { hover = null; tip.style.display = 'none'; if (!drag) draw(); });
    canvas.addEventListener('dblclick', () => { setView(0, secs); draw(); });

    // ---- follow the audio
    if (audio) {
      let raf = 0, n = 0;
      const follow = t => { if (!zoomed() || (t >= view.t0 && t <= view.t1)) return; const s = span(), t0 = Math.max(0, Math.min(secs - s, t - s * 0.1)); setView(t0, t0 + s); };
      const tick = () => { const t = audio.currentTime; follow(t); draw(); if (n++ % 6 === 0) now.innerHTML = nowText(t); if (!audio.paused) raf = requestAnimationFrame(tick); };
      audio.addEventListener('play', () => { cancelAnimationFrame(raf); tick(); });
      audio.addEventListener('pause', draw); audio.addEventListener('ended', draw);
      audio.addEventListener('seeked', () => { draw(); now.innerHTML = nowText(audio.currentTime); });
    }
    window.addEventListener('resize', draw);
    draw();
  }
})();
