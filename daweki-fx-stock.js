/*
 * DAWEKI FX – STOCK csomag: EQ (5 sáv) · Saturation · Widener (M/S)
 * ----------------------------------------------------------
 * A DAWEKI korábban beépített sáv-effektjei, külső JS-ként.
 * Használat: mixer → sáv FX gombja → LOAD JS… → válaszd ezt a fájlt,
 * majd az „— add effect —” listából add hozzá a kívánt effektet(eket).
 *
 * A régi (JS-ek előtti) projektek EQ / SAT / M-S beállításait a DAWEKI megnyitáskor
 * automatikusan erre a csomagra képezi le (csomag id: daweki-stock; effekt id-k: eq5, sat, widener;
 * paraméter kulcsok: f1..f5, g1..g5, amount, width) – ezeket ezért ne nevezd át.
 */
(function(){
  'use strict';
  if(typeof window.registerFxPack !== 'function'){
    throw new Error('A DAWEKI registerFxPack API nem található – ez a fájl csak a DAWEKI-ba betöltve működik.');
  }

  /* ================= 1. EQ (5 sáv) ================= */
  const EQ_BANDS = [
    { type:'lowshelf',  freq:80,    q:1, label:'LOW SHELF' },
    { type:'peaking',   freq:300,   q:1, label:'LOW-MID' },
    { type:'peaking',   freq:1000,  q:1, label:'MID' },
    { type:'peaking',   freq:3500,  q:1, label:'HIGH-MID' },
    { type:'highshelf', freq:10000, q:1, label:'HIGH SHELF' }
  ];

  function createEq(ctx){
    const input = ctx.createGain();
    const output = ctx.createGain();
    const filters = EQ_BANDS.map(def => {
      const f = ctx.createBiquadFilter();
      f.type = def.type;
      f.frequency.value = def.freq;
      if(def.type === 'peaking') f.Q.value = def.q;
      f.gain.value = 0;
      return f;
    });
    input.connect(filters[0]);
    for(let i = 0; i < filters.length - 1; i++) filters[i].connect(filters[i + 1]);
    filters[filters.length - 1].connect(output);
    return {
      input, output,
      setParam(key, value){
        const m = /^([fg])([1-5])$/.exec(key);
        if(!m) return;
        const f = filters[+m[2] - 1];
        if(m[1] === 'f') f.frequency.value = value; else f.gain.value = value;
      }
    };
  }

  const EQ_PARAMS = [];
  EQ_BANDS.forEach((b, i) => {
    EQ_PARAMS.push({ key:'f' + (i + 1), label:b.label + ' FREQ', min:20, max:20000, step:1, default:b.freq, unit:' Hz', scale:'log' });
    EQ_PARAMS.push({ key:'g' + (i + 1), label:b.label + ' GAIN', min:-12, max:12, step:0.5, default:0, unit:' dB' });
  });

  const EQ_CSS = `
    .eq{ width:560px; padding:14px 16px 16px; background:linear-gradient(180deg,#1b2433,#0d131d); color:#dbe6f5; }
    .eq-top{ display:flex; align-items:baseline; justify-content:space-between; margin-bottom:8px; }
    .eq-logo{ font-size:16px; font-weight:900; letter-spacing:4px; color:#3fe0c8; text-shadow:0 0 12px rgba(63,224,200,.4); }
    .eq-sub{ font-size:8px; letter-spacing:2px; color:#6f819b; }
    .eq-scope{ display:block; width:100%; height:120px; border-radius:6px; background:#070c14; border:1px solid #1a2535; box-shadow:inset 0 2px 8px rgba(0,0,0,.9); }
    .eq-bands{ display:grid; grid-template-columns:repeat(5,1fr); gap:6px; margin-top:12px; }
    .eq-band{ display:flex; flex-direction:column; align-items:center; gap:10px; padding:8px 0 6px; border-radius:6px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.05); }
    .eq-band-name{ font-size:8px; font-weight:800; letter-spacing:1.5px; color:#3fe0c8; }
    .eq .fx-knob-wrap{ width:70px; }
    .eq .fx-knob-label{ min-height:12px; }
  `;

  function renderEqGui(root, api){
    root.innerHTML =
      '<div class="eq">' +
        '<div class="eq-top"><span class="eq-logo">EQ</span><span class="eq-sub">DAWEKI STOCK · 5 BAND</span></div>' +
        '<canvas class="eq-scope" width="528" height="120"></canvas>' +
        '<div class="eq-bands"></div>' +
      '</div>';
    const cv = root.querySelector('.eq-scope'), g = cv.getContext('2d');
    const bandsEl = root.querySelector('.eq-bands');
    const scratch = new OfflineAudioContext(1, 1, 48000);   // csak a szűrők frekvenciamenetének számolásához
    const N = 264, freqs = new Float32Array(N), mag = new Float32Array(N), phase = new Float32Array(N);
    for(let i = 0; i < N; i++) freqs[i] = 20 * Math.pow(1000, i / (N - 1));   // 20 Hz .. 20 kHz
    const DB = 15;                                                           // ±15 dB a rajzon

    function draw(){
      const total = new Float32Array(N);
      EQ_BANDS.forEach((b, i) => {
        const f = scratch.createBiquadFilter();
        f.type = b.type; f.Q.value = b.q;
        f.frequency.value = api.getParam('f' + (i + 1));
        f.gain.value = api.getParam('g' + (i + 1));
        f.getFrequencyResponse(freqs, mag, phase);
        for(let k = 0; k < N; k++) total[k] += 20 * Math.log10(Math.max(mag[k], 1e-6));
      });
      const W = cv.width, H = cv.height, y = db => H / 2 - (db / DB) * (H / 2 - 6);
      g.clearRect(0, 0, W, H);
      g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1; g.fillStyle = '#4b5b73'; g.font = '9px sans-serif';
      [-12, -6, 0, 6, 12].forEach(db => { g.beginPath(); g.moveTo(0, y(db)); g.lineTo(W, y(db)); g.stroke(); g.fillText((db > 0 ? '+' : '') + db, 4, y(db) - 2); });
      [100, 1000, 10000].forEach(hz => {
        const x = Math.log(hz / 20) / Math.log(1000) * W;
        g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
        g.fillText(hz >= 1000 ? (hz / 1000) + 'k' : hz, x + 3, H - 4);
      });
      g.beginPath();
      for(let k = 0; k < N; k++){ const x = k / (N - 1) * W; if(k === 0) g.moveTo(x, y(total[k])); else g.lineTo(x, y(total[k])); }
      g.lineWidth = 2; g.strokeStyle = api.getEnabled() ? '#3fe0c8' : '#4b5b73'; g.stroke();
      g.lineTo(W, y(0)); g.lineTo(0, y(0)); g.closePath();
      g.fillStyle = api.getEnabled() ? 'rgba(63,224,200,.12)' : 'rgba(75,91,115,.10)'; g.fill();
    }

    EQ_BANDS.forEach((b, i) => {
      const col = document.createElement('div'); col.className = 'eq-band';
      const name = document.createElement('div'); name.className = 'eq-band-name'; name.textContent = (i + 1) + ' · ' + b.label;
      col.appendChild(name);
      ['f', 'g'].forEach(kind => {
        const p = api.params.find(x => x.key === kind + (i + 1));
        col.appendChild(api.createKnob(p, draw));      // 2. paraméter: változáskor hívott függvény
      });
      bandsEl.appendChild(col);
    });
    draw();
    const off = api.onEnabledChange(draw);
    return () => off();
  }

  /* ================= 2. SATURATION (sub + glue kompresszió + air) ================= */
  function createSat(ctx){
    const input = ctx.createGain();
    const subShelf = ctx.createBiquadFilter();
    subShelf.type = 'lowshelf'; subShelf.frequency.value = 90; subShelf.gain.value = 0;
    const glueComp = ctx.createDynamicsCompressor();
    glueComp.threshold.value = 0; glueComp.ratio.value = 1; glueComp.knee.value = 6; glueComp.attack.value = 0.012; glueComp.release.value = 0.28;
    const airShelf = ctx.createBiquadFilter();
    airShelf.type = 'highshelf'; airShelf.frequency.value = 11000; airShelf.gain.value = 0;
    const output = ctx.createGain();
    input.connect(subShelf); subShelf.connect(glueComp); glueComp.connect(airShelf); airShelf.connect(output);
    return {
      input, output,
      setParam(key, value){
        if(key !== 'amount') return;
        subShelf.gain.value = value * 6;
        airShelf.gain.value = value * 5;
        glueComp.threshold.value = -value * 18;
        glueComp.ratio.value = 1 + value * 3;
      }
    };
  }

  /* ================= 3. WIDENER (M/S) ================= */
  function createWidener(ctx){
    const input = ctx.createGain();
    const splitter = ctx.createChannelSplitter(2);
    input.connect(splitter);
    const mono = (n) => { n.channelCount = 1; n.channelCountMode = 'explicit'; n.channelInterpretation = 'discrete'; return n; };
    const mid = mono(ctx.createGain()); mid.gain.value = 0.5;
    splitter.connect(mid, 0, 0); splitter.connect(mid, 1, 0);
    const rInv = mono(ctx.createGain()); rInv.gain.value = -1;
    splitter.connect(rInv, 1, 0);
    const side = mono(ctx.createGain()); side.gain.value = 0.5;
    splitter.connect(side, 0, 0); rInv.connect(side, 0, 0);
    const sideWidth = mono(ctx.createGain()); sideWidth.gain.value = 1;
    side.connect(sideWidth);
    const sideWidthInv = mono(ctx.createGain()); sideWidthInv.gain.value = -1;
    sideWidth.connect(sideWidthInv);
    const merger = ctx.createChannelMerger(2);
    mid.connect(merger, 0, 0); sideWidth.connect(merger, 0, 0);
    mid.connect(merger, 0, 1); sideWidthInv.connect(merger, 0, 1);
    const output = ctx.createGain();
    merger.connect(output);
    return {
      input, output,
      setParam(key, value){ if(key === 'width') sideWidth.gain.value = value; }
    };
  }

  /* ================= REGISZTRÁCIÓ ================= */
  window.registerFxPack({
    id: 'daweki-stock',
    name: 'DAWEKI STOCK',
    effects: [
      { id: 'eq5', name: 'EQ (5 band)', createNode: createEq, params: EQ_PARAMS, css: EQ_CSS, renderGUI: renderEqGui },
      { id: 'sat', name: 'Saturation', createNode: createSat,
        params: [ { key:'amount', label:'Amount', min:0, max:1, step:0.01, default:0.3, unit:'' } ] },
      { id: 'widener', name: 'Widener (M/S)', createNode: createWidener,
        params: [ { key:'width', label:'Width', min:0, max:2, step:0.02, default:1.3, unit:' x' } ] }
    ]
  });
})();
