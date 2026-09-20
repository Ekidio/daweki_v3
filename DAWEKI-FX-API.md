# DAWEKI FX plugin API (v2)

> **Kód nélkül is készíthetsz effektet:** a `daweki-fx-maker.html` (DAWEKI FX MAKER) **Egyszerű módban** (alapértelmezett) csak választasz egyet a 31 kész
> effekt közül (kompresszorok: VCA / FET / optikai / vari-mu / bus, limiter, EQ-k: grafikus, parametrikus, dinamikus, spektrumos, **dinamikus spektrum-EQ (8 sáv, sávonkénti kompresszió/expander)**, tone control,
> csatorna-sáv, sztereo-kezelő (M/S), digitális delay, LFO-szűrő, air exciter, sub-basszus, reverb, chorus, flanger, phaser, tremolo…), kiválasztasz egy kinézetet, átírod a
> potméterek nevét/tartományát, kipróbálod hallgatva, és **EXPORT .JS**-sel kész, ennek az API-nak megfelelő fájlt kapsz.
> **Haladó módban** (ADVANCED gomb) blokkokat kötsz össze, potmétereket vezetsz ki és szabadon megrajzolod a GUI-t.
> **Channel strip:** a MAKER fejlécében a **CHANNEL STRIP…** gombbal 2–4 kész effektet fűzöl egymás után egyetlen pluginná (előre elkészített láncok is vannak:
> Vocal, Drum bus, Bass, Guitar/synth, Mastering). Minden modul azonos méretű téglalapot kap, saját **ON** kapcsolóval és saját potméterekkel (`s1_…`, `s2_…` kulcsokkal).
> Elrendezés: 2 modul egymás mellett, 3 modul egymás alatt, 4 modul 2×2 (sorrend: bal felső, jobb felső, bal alsó, jobb alsó). Ha a felület túl nagy, kicsinyítve jelenik meg (`zoom`).
> Az eredmény hagyományos projekt: exportálható, szerkeszthető.
> Az exportált JS-be a projekt is beépül, így a MAKER-be bármikor visszatölthető és szerkeszthető (OPEN… / .js).
> Az alábbi leírás azoknak kell, akik kézzel írnak effektet, vagy értenék, mit generál a MAKER (CODE gomb).

Egy DAWEKI effekt **egyetlen `.js` fájl**: a hangfeldolgozás, a paraméterek és (opcionálisan) a saját GUI is benne van.
A fájlt a mixerben a sáv **FX** gombja → **LOAD JS…** paranccsal töltöd be. A betöltés után:
- **egy effektes fájl** (`registerFx`) azonnal az adott sáv effektláncába kerül;
- **több effektes csomag** (`registerFxPack`, pl. STOCK, EKI) az „— add effect —” listába kerül, onnan választod ki, melyik effektet
  akarod (a lista már előre az új csomag első effektjén áll). Bármelyik betöltött effekt bármelyik sávra hozzáadható.

Az effektek sávonként (max. 8) sorban futnak egymás után, a lista sorrendjében, a PAN és a fader előtt. A DAWEKI-ban **nincs
beépített sáv-effekt**: az EQ / Saturation / Widener is ilyen JS.

Kiindulópontok ebben a mappában:
- `daweki-fx-stock.js` – **STOCK csomag**: EQ (5 sáv, frekvenciagörbével), Saturation, Widener (M/S)
- `daweki-fx-example-tremolo.js` – **sablon**: egy effekt, saját GUI-val, saját CSS-sel, Base64 háttérrel
- `daweki-fx-pack-EKI.js` – **csomag**: 4 effekt, GUI nélkül (a DAWEKI alap potméteres GUI-t rajzol nekik)

## 1. Regisztráció

```js
window.registerFx({ ...effekt });                              // egy effekt egy fájlban
window.registerFxPack({ id, name, effects: [{...}, {...}] });  // több effekt egy fájlban
```

Ha a fájl hiba nélkül lefut, de semmit sem regisztrál, a DAWEKI „no effect registered" hibát jelez.
Ugyanazt az `id`-jú csomagot/effektet újra betöltve a sávokon lévő insertek **azonnal frissülnek** (fejlesztéshez kényelmes).
A projekt az insertet `packId` + `effId` alapján menti, ezért **az `id`-kat ne változtasd** kész effektnél.

## 2. Az effekt leírója

| mező | kötelező | leírás |
|---|---|---|
| `id` | igen | egyedi azonosító (a projektbe is ez kerül) |
| `name` | igen | megjelenített név |
| `createNode(ctx)` | igen | felépíti a Web Audio gráfot, visszaad egy objektumot (lásd lent) |
| `prepare(ctx)` | nem | **(v2)** aszinkron előkészítés, Promise-t ad (pl. `AudioWorklet` modul betöltése). Lásd lent |
| `params` | nem | `[{ key, label, min, max, step, default, unit, scale, choices, syncBy }]` – ezek mentődnek a projektbe. `scale:'log'` logaritmikus potmétert ad (frekvenciához; `min` > 0), `unit:' Hz'` 1000 fölött kHz-ben jelenik meg. **(v2)** `choices:['Free','1/8',…]` lépcsős választót ad: az érték egész szám (`min`…`max`), a potméter a feliratot mutatja; `syncBy:'kulcs'` jelzi, hogy ezt a paramétert a `kulcs` nevű választó (tempó-osztás) felülírhatja |
| `latency` | nem | **(v2)** az effekt késleltetése másodpercben (pl. előrelátó limiter: `0.004`). A DAWEKI a sávok között kompenzálja (PDC): a nagyobb késleltetésű sávhoz igazítja a többit, az insert be/ki kapcsolása pedig nem tolja el az időzítést. A render is igazított. A FX MAKER ezt magától kiszámolja és beírja |
| `css` | nem | a plugin saját CSS-e (Base64 `data:` URL is lehet benne) |
| `renderGUI(root, api)` | nem | a saját GUI felépítése; visszaadhat egy takarító függvényt |
| `packId`, `packName` | nem | csak `registerFx`-nél: a csoportnév a listában (alapból az effekt id/name) |

### `prepare(ctx)` (API v2) – aszinkron előkészítés
Ha az effekt saját jelfeldolgozó kódot (`AudioWorklet`) használ, a modul betöltése aszinkron (`ctx.audioWorklet.addModule(...)`), a `createNode` viszont szinkron.
Ilyenkor add meg a `prepare(ctx)` függvényt, amely Promise-t ad vissza:
- a DAWEKI **minden hangkörnyezetre** (élő és a renderelő `OfflineAudioContext`) meghívja, **mielőtt** `createNode`-ot hívna;
- amíg az előkészítés tart, az insert átengedő („LOADING DSP…"), utána a sáv lánca magától újraépül;
- ha elbukik, az insert átengedő lesz, és a panel kiírja a hibát;
- ugyanarra a `ctx`-re lehet több effektfájlból is hívni: a `registerProcessor`-t védd `try/catch`-csel, és a processzor neve legyen verziózott (pl. `fxm-comp-1`).
A régi (`prepare` nélküli) effektek változatlanul működnek. A FX MAKER blokkjai közül a **Compressor+**, az **Envelope**, a **Sub octave**, a **Dynamic band**, a **Dynamic gain**, a **Stereo delay** és a **Limiter** használ ilyen jelfeldolgozó kódot; az exportált `.js` tartalmazza a `prepare`-t és a processzor forrását.
**Fontos:** a processzor modulját `data:` URL-ként töltsd be (`addModule('data:text/javascript;base64,…')`), ne `blob:` URL-ként: ha a DAWEKI vagy a MAKER lemezről (`file://`) van megnyitva, a `blob:` URL-es `addModule` elbukik, és az effekt némán átengedő marad. A MAKER exportja így tölt (a `blob:` csak tartalék). Régebbi MAKER-ben exportált, worklet-es effektet exportáld újra.

### `createNode(ctx)` → `{ input, output, setParam, setTempo, getState, dispose }`
- `ctx` lehet valós idejű `AudioContext` **és** `OfflineAudioContext` (render) – ezért mindent a `ctx`-ből hozz létre.
- `input` / `output`: egy-egy `AudioNode`. A DAWEKI köréjük építi a dry/wet kapcsolót (ON/OFF kattanásmentesen).
- `setParam(key, value)`: a DAWEKI hívja induláskor a mentett/alap értékekkel, és minden változtatáskor.
  Simításhoz használd a `param.setTargetAtTime(value, ctx.currentTime, 0.02)` formát.
- `setTempo(bpm)` (opcionális, **v2**): a DAWEKI a projekt tempójával hívja az effekt létrehozásakor és minden BPM-változáskor (a renderelő `OfflineAudioContext`-ben is). Ritmikus effektekhez (delay, LFO-sebesség, pre-delay): ha a felhasználó egy `1/8`-os osztást választ, az effekt a saját idejét/frekvenciáját a BPM-ből számolja. A FX MAKER minden sablonja, amiben van *Rate* / *Time*, kapott ilyen **Sync** választót (Free, 1/32 … 1/1, 2/1, triolás és pontozott értékekkel); a MAKER lejátszójában van BPM mező.
- `getState()` (opcionális, **v2**): az effekt belső állapota a saját GUI-nak. A FX MAKER dinamikus blokkjai itt adják a sávok pillanatnyi erősítését (`{ gr: [dB…] }`), amit a spektrum-EQ mozgó gyűrűi mutatnak. A GUI az `api.getState()`-en át olvassa.
- `dispose()` (opcionális): oszcillátorok leállítása, időzítők törlése – akkor hívja a DAWEKI, ha az insert megszűnik.
- Ha `createNode` kivételt dob, az insert **átengedő** lesz (a hangút nem törik el), a panel pedig kiírja a hibát.

## 3. Saját GUI

`renderGUI(root, api)` a plugin **saját, izolált (Shadow DOM) felületébe** rajzol: a DAWEKI CSS-e nem hat rá, a te CSS-ed sem szivárog ki.
Nyugodtan használj `innerHTML`-t, `<canvas>`-t, SVG-t, Base64 képet.

`api`:

| tag | leírás |
|---|---|
| `getParam(key)` / `setParam(key, value)` | paraméter olvasás / írás (a `min`–`max` közé szorítva, mentődik, a hangra is hat) |
| `params` | a `params` tömb (min/max/default…) |
| `createKnob(param, onChange)` | kész potméter elem (`.fx-knob`, `.fx-knob-label`, `.fx-knob-value` – a saját CSS-eddel felülírható). Az opcionális `onChange(érték)` minden változtatás után lefut (pl. görbe újrarajzolásához) |
| `getLevel('in' \| 'out')` | aktuális csúcsszint (lineáris, 0..1) az effekt bemenetén / kimenetén – `requestAnimationFrame`-ből olvasd |
| `getState()` | **(v2)** az élő effekt `getState()` eredménye (vagy `null`) – `requestAnimationFrame`-ből olvasd |
| `beginGesture(key)` / `endGesture(key)` | **(v2, automatizálás)** a felület „megfogta" / „elengedte" a paramétert (pl. gomb `pointerdown` / `pointerup`). TOUCH (latch) módban a felvétel az első megfogástól a lejátszás leállításáig tart, az elengedés csak jelzés. Hívása nem kötelező |
| `getAutomation(key)` | **(v2)** a paraméter automatizálási állapota: `'none'`, `'has'` (van felvétel), `'ovr'` (READ-ben kézzel felülírva), `'rec'` (éppen írja), `'off'` (van, de az AUTO ki van kapcsolva) – jelzőpontnak |
| `onParamChange(fn)` | **(v2)** a host változtatta a paramétert (automatizálás lejátszása, visszavonás, betöltés) vagy megváltozott az automatizálási állapot: `fn(key)` (`key = null`: mindent frissíts). Visszaad egy leiratkozó függvényt |
| `paramMenu(key, mouseEvent)` | **(v2)** a jobb klikk menü (automatizálás törlése): a `contextmenu` eseménnyel hívd |
| `getSpectrum('in' \| 'out')` | **(v2)** dB-spektrum (`Float32Array`, 2048 sáv, 4096-os FFT; a mintavételi frekvencia `api.ctx.sampleRate`) – élő spektrum-kijelzőhöz; `requestAnimationFrame`-ből olvasd. Régebbi DAWEKI-ban nincs: ellenőrizd, hogy létezik-e |
| `getEnabled()` / `setEnabled(bool)` / `onEnabledChange(fn)` | az effekt ON/OFF állapota |
| `ctx`, `pack`, `effect`, `track` | a hangkörnyezet, a csomag- és effektadatok, a sáv (`index`, `name`, `color`) |

Ha van `requestAnimationFrame`-ed vagy időzítőd, a `renderGUI` **adjon vissza egy függvényt**, ami leállítja: a DAWEKI az ablak
bezárásakor (és a GUI újraépítésekor) meghívja.

Ha nincs `renderGUI`, a DAWEKI a `params` alapján potméteres alap GUI-t (be/ki LED-mérővel) rajzol.

## Automatizálás (v2)
A DAWEKI-ban az effektek paramétereit (a sáv hangerejével, pánjával és send-jeivel együtt) fel lehet venni és vissza lehet játszani:
- **AUTO: OFF / READ / TOUCH** a felső sávban. **TOUCH (LATCH-viselkedéssel):** lejátszás közben bármit megmozgatsz, az az első érintéstől rögzül, és elengedés után **az utolsó
  értéken marad** (ezt írja tovább) a lejátszás leállításáig – nem ugrik vissza a régi görbére. Leállás után a meglévő görbe folytatódik. **READ:** lejátssza a görbéket (a gombok és fadersek mozognak). Leállás után magától nem vált READ-re.
- A **jelzőpont** a paraméter mellett: zöld = van felvétel, piros = éppen írja, borostyán = READ-ben kézzel felülírtad (a lejátszás végéig), szürke = AUTO ki.
- **Jobb klikk** a paraméteren: „Clear automation"; a sáv fejlécén: az egész sáv automatizálásának törlése. Egy lejátszási menet egy **Ctrl+Z** lépés.
- A `render` is használja a görbéket. A projekt (`.daweki`) menti őket; az effektek `aid` azonosítót kapnak, így átrendezéskor sem vesznek el.
- A FX MAKER-ből exportált effektek felülete automatikusan tudja ezt (megfogás-jelzés, pont, jobb klikk, követés). Kézzel írt felületnél a fenti `api` függvényeket
  hívd; ha nem hívod, a felvétel akkor is működik, csak jelzőpont nincs.
- **Görbe a sávon:** az automatizált paraméter görbéje (vonal + pontok) megjelenik a sávon; felvétel közben pirosan, élőben rajzolódik. A sáv fejlécén a zöld
  `∿` jelző mutatja, melyik paraméter látszik; kattintásra (vagy jobb klikkre a fejlécen) választhatsz másikat, elrejtheted, vagy törölheted. A görbe csak megjelenítés (szerkeszthetősége később jön).
- Az effekt ablakának fejlécében **REC** (íráskor) / **AUTO** (van felvétel) jelzés látszik akkor is, ha a felület nem rajzol pontot.
- TOUCH módban álló lejátszásnál nem rögzít; ha ekkor mozgatsz valamit, a DAWEKI szól, hogy előbb nyomj PLAY-t (a lejátszáshoz legalább egy régió kell).
- Nem automatizálható: a master hangerő és a mute/solo (egyelőre).

## 4. Minimális példa

```js
(function(){
  window.registerFx({
    id: 'my_gain', name: 'My Gain',
    createNode(ctx){
      const g = ctx.createGain();
      return { input: g, output: g,
        setParam(k, v){ if(k === 'gain') g.gain.setTargetAtTime(Math.pow(10, v / 20), ctx.currentTime, 0.02); } };
    },
    params: [{ key: 'gain', label: 'Gain', min: -24, max: 12, step: 0.5, default: 0, unit: ' dB' }]
  });
})();
```

## 5. Tudnivalók

- A betöltött `.js` **teljes jogosultsággal fut az oldalon**, ezért csak olyan fájlt tölts be, amit ismersz / te írtál.
- **A projektfájl (`.daweki`) magával viszi a benne használt effektek JS-ét.** Mentéskor a projektbe kerül a projektben ténylegesen
  használt csomagok forráskódja (fájlonként egyszer; a nem használt betöltött csomagok nem). Megnyitáskor ezek automatikusan betöltődnek,
  így a projekt a `.js` fájlok nélkül, másik gépen is megszólal.
  - Ha a csomag **már be van töltve** az adott munkamenetben, a betöltött verzió marad, a projektben lévő nem írja felül.
  - Ha a script **ismeretlen** (még nem töltötted be kézzel, és korábban nem fogadtad el), a DAWEKI megerősítést kér
    („EFFECT SCRIPTS IN PROJECT” – LOAD / SKIP), mert idegen projektben idegen kód futna. A SKIP-nél (vagy az ablak bezárásakor) a projekt
    az effektek nélkül töltődik be („NOT LOADED” jelzéssel, átengedő hanggal).
  - Amit kézzel betöltöttél, vagy a megerősítésnél elfogadtál, azt a DAWEKI a tartalma (SHA-256 hash) alapján megjegyzi ebben a böngészőben,
    és legközelebb nem kérdez rá.
  - Hibás script nem akasztja meg a projekt betöltését, csak hibaüzenetet kapsz.
- A plugin fájlt egy új DAWEKI-indításkor kézzel kell betölteni (a STOCK csomagot is, ha EQ / SAT / Widener kell), kivéve, ha egy megnyitott projekt magával hozza.
- A régi (JS effektek előtti) projektek beépített EQ / SAT / M-S beállításait a DAWEKI megnyitáskor automatikusan a STOCK csomag
  effektjeire képezi le (csomag: `daweki-stock`; effektek: `eq5`, `sat`, `widener`; paraméterek: `f1..f5`, `g1..g5`, `amount`, `width`).
  Amíg a `daweki-fx-stock.js` nincs betöltve, ezek „NOT LOADED” jelzéssel átengedik a hangot.
- A renderbe (`RENDER`) az insertek is beleszámítanak. Az `AudioWorklet`-et használó effekt renderelése külön odafigyelést igényel.
- A GUI-ablak a DAWEKI többi vezérlőjétől függetlenül mozgatható (a fejlécénél fogva), a gyorsbillentyűk a plugin
  `input`/`textarea`/`select` elemeiben való gépelés közben nem sülnek el.
