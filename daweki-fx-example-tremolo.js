/*
 * DAWEKI FX – PÉLDA / SABLON: TREMOLO
 * ----------------------------------------------------------
 * Egyetlen effekt egy fájlban (registerFx), SAJÁT GUI-val és SAJÁT CSS-sel.
 * Használat: mixer → sáv FX gombja → LOAD JS… → válaszd ezt a fájlt.
 *
 * Új effekt készítéséhez másold le ezt a fájlt, és cseréld ki:
 *   - id / name
 *   - createNode(ctx)   – a hangfeldolgozó (Web Audio) rész
 *   - params            – a mentendő paraméterek
 *   - css + renderGUI   – a kinézet (opcionális: ha kihagyod, a DAWEKI alap potméteres GUI-t ad)
 * Teljes leírás: DAWEKI-FX-API.md
 */
(function(){
  'use strict';
  if(typeof window.registerFx !== 'function'){
    throw new Error('A DAWEKI registerFx API nem található – ez a fájl csak a DAWEKI-ba betöltve működik.');
  }

  /* ---------- 1. HANGFELDOLGOZÁS ---------- */
  function createNode(ctx){
    const input = ctx.createGain();
    const output = ctx.createGain();
    const trem = ctx.createGain();          // ezt moduláljuk
    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 4;
    trem.gain.value = 0.7;                  // 1 - depth/2
    lfoDepth.gain.value = 0.3;              // depth/2
    lfo.connect(lfoDepth);
    lfoDepth.connect(trem.gain);
    lfo.start();
    input.connect(trem);
    trem.connect(output);

    const SHAPES = ['sine', 'triangle', 'square'];
    return {
      input, output,
      setParam(key, value){
        const t = ctx.currentTime;
        if(key === 'rate') lfo.frequency.setTargetAtTime(value, t, 0.02);
        else if(key === 'depth'){
          trem.gain.setTargetAtTime(1 - value / 2, t, 0.02);
          lfoDepth.gain.setTargetAtTime(value / 2, t, 0.02);
        }
        else if(key === 'shape') lfo.type = SHAPES[Math.round(value)] || 'sine';
      },
      dispose(){                            // a DAWEKI hívja, ha az insert megszűnik
        try{ lfo.stop(); }catch(e){}
        try{ lfo.disconnect(); }catch(e){}
      }
    };
  }

  /* ---------- 2. SAJÁT CSS (Shadow DOM-ban fut, nem ütközik a DAWEKI-val) ---------- */
  // A háttérmintázat egy Base64-be kódolt SVG – így nincs külső fájl.
  const PATTERN = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc4JyBoZWlnaHQ9JzgnPjxwYXRoIGQ9J00wIDhMOCAwJyBzdHJva2U9JyNmZmZmZmYnIHN0cm9rZS1vcGFjaXR5PScuMDYnLz48L3N2Zz4=';
  const CSS = `
    .trem{ width:380px; padding:14px 18px 16px; color:#f5e9d0;
      background:#3a2416 url("${PATTERN}"); }
    .trem-top{ display:flex; align-items:baseline; justify-content:space-between; margin-bottom:10px; }
    .trem-logo{ font-size:20px; font-weight:900; letter-spacing:4px; color:#ffb454; text-shadow:0 0 12px rgba(255,180,84,.45); }
    .trem-sub{ font-size:8px; letter-spacing:2px; color:#b08a63; }
    .trem-scope{ display:block; width:100%; height:70px; border-radius:6px; background:#120a05;
      border:1px solid #1b0f08; box-shadow:inset 0 2px 8px rgba(0,0,0,.9); }
    .trem-row{ display:flex; align-items:flex-end; justify-content:space-around; margin-top:12px; gap:8px; }
    .trem .fx-knob{ background:radial-gradient(circle at 30% 30%,#d8a15d,#4a2a12); }
    .trem .fx-knob-indicator{ background:#1b0f08; box-shadow:none; }
    .trem .fx-knob-label{ color:#b08a63; }
    .trem-shapes{ display:flex; flex-direction:column; gap:5px; }
    .trem-shape{ font:inherit; font-size:9px; font-weight:800; letter-spacing:1.5px; padding:5px 12px; cursor:pointer;
      color:#b08a63; background:#241409; border:1px solid #120a05; border-radius:4px; }
    .trem-shape.on{ color:#1b0f08; background:#ffb454; box-shadow:0 0 10px rgba(255,180,84,.6); }
    .trem-meter{ height:4px; margin-top:12px; border-radius:2px; background:#120a05; overflow:hidden; }
    .trem-meter > i{ display:block; height:100%; width:0; background:linear-gradient(90deg,#4ade80,#ffb454,#ef4444); }
  `;

  /* ---------- 3. SAJÁT GUI ----------
     root: a plugin saját (izolált) DOM-ja. api: getParam/setParam, createKnob,
     getLevel('in'|'out'), getEnabled/setEnabled/onEnabledChange. */
  function renderGUI(root, api){
    root.innerHTML =
      '<div class="trem">' +
        '<div class="trem-top"><span class="trem-logo">TREMOLO</span><span class="trem-sub">DAWEKI FX · EXAMPLE</span></div>' +
        '<canvas class="trem-scope" width="344" height="70"></canvas>' +
        '<div class="trem-row"><div class="k-rate"></div><div class="k-depth"></div><div class="trem-shapes"></div></div>' +
        '<div class="trem-meter"><i></i></div>' +
      '</div>';

    const pRate  = api.params.find(p => p.key === 'rate');
    const pDepth = api.params.find(p => p.key === 'depth');
    root.querySelector('.k-rate').appendChild(api.createKnob(pRate));
    root.querySelector('.k-depth').appendChild(api.createKnob(pDepth));

    const shapesEl = root.querySelector('.trem-shapes');
    const buttons = ['SINE', 'TRI', 'SQR'].map((label, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'trem-shape'; b.textContent = label;
      b.addEventListener('click', () => { api.setParam('shape', i); paintShapes(); });
      shapesEl.appendChild(b);
      return b;
    });
    function paintShapes(){ buttons.forEach((b, i) => b.classList.toggle('on', Math.round(api.getParam('shape')) === i)); }
    paintShapes();

    // Élő LFO-rajz + bemeneti szint
    const cv = root.querySelector('.trem-scope'), g = cv.getContext('2d');
    const bar = root.querySelector('.trem-meter > i');
    let raf = 0, alive = true, phase = 0, last = performance.now();
    function lfoAt(x, shape){
      const s = Math.sin(x * 2 * Math.PI);
      if(shape === 1) return (2 / Math.PI) * Math.asin(s);
      if(shape === 2) return s >= 0 ? 1 : -1;
      return s;
    }
    function draw(now){
      if(!alive) return;
      const dt = (now - last) / 1000; last = now;
      const rate = api.getParam('rate'), depth = api.getParam('depth'), shape = Math.round(api.getParam('shape'));
      phase += dt * rate;
      g.clearRect(0, 0, cv.width, cv.height);
      g.strokeStyle = api.getEnabled() ? '#ffb454' : '#6b5137';
      g.lineWidth = 2; g.beginPath();
      for(let x = 0; x <= cv.width; x++){
        const gain = 1 - depth / 2 + (depth / 2) * lfoAt(phase - x / 86, shape);
        const y = cv.height - 6 - gain * (cv.height - 12);
        if(x === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
      bar.style.width = Math.min(100, api.getLevel('out') * 100) + '%';
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => { alive = false; cancelAnimationFrame(raf); };   // takarítás az ablak zárásakor
  }

  /* ---------- 4. REGISZTRÁCIÓ ---------- */
  window.registerFx({
    id: 'example_tremolo',
    name: 'Tremolo (example)',
    createNode,
    css: CSS,
    renderGUI,
    params: [
      { key: 'rate',  label: 'Rate',  min: 0.2, max: 15, step: 0.1,  default: 4,   unit: ' Hz' },
      { key: 'depth', label: 'Depth', min: 0,   max: 1,  step: 0.01, default: 0.6, unit: '' },
      { key: 'shape', label: 'Shape', min: 0,   max: 2,  step: 1,    default: 0,   unit: '' }
    ]
  });

})();
