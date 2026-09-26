# DAWEKI V3 + DAWEKI FX MAKER

[🇬🇧 English](README.md) · 🇭🇺 Magyar

**▶ Kipróbálás online:** [DAWEKI V3](https://ekidio.github.io/daweki_v3/) · [DAWEKI FX MAKER](https://ekidio.github.io/daweki_v3/daweki-fx-maker.html)

<img width="1710" height="900" alt="Screenshot 2026-09-26 at 20 27 49" src="https://github.com/user-attachments/assets/d0792c88-3d5f-4dc6-af1b-8b85fcbc3119" />
<img width="1710" height="903" alt="Screenshot 2026-09-26 at 20 25 21" src="https://github.com/user-attachments/assets/9fd01509-a9a0-41b4-8a16-8a5bb48b2698" />


A **DAWEKI V3** egyetlen fájlból álló, böngészőben futó hangszerkesztő és keverő (DAW), vanilla JavaScripttel és Web Audio API-val készült.
A **DAWEKI FX MAKER** a párja: szintén egyfájlos, böngészős effekttervező, amely a DAWEKI-ba betölthető `.js` sáveffekteket exportál.

Nem kell telepíteni, buildelni vagy szervert futtatni. Nyisd meg a HTML-fájlt egy modern böngészőben, és kezdheted.

## Tartalom

| Fájl | Leírás |
|---|---|
| `index.html` | **DAWEKI V3**, a DAW (sávok, régiók, keverő, automáció, FX-slotok, renderelés) |
| `daweki-fx-maker.html` | **DAWEKI FX MAKER**, effekttervező, amely DAWEKI `.js` effekteket exportál |
| `DAWEKI-FX-API.md` | A DAWEKI FX plugin API (v2) leírása |
| `daweki-fx-stock.js` | **STOCK** effektcsomag: 5 sávos EQ, Saturation, Widener (M/S) |
| `daweki-fx-example-tremolo.js` | Sablon: egy effekt saját GUI-val és CSS-sel |
| `daweki-fx-daweki_ekitronix_ala2_silver.js` | Kész, az FX MAKER-rel exportált effekt |

## DAWEKI V3: a DAW

- Többsávos szerkesztés régiókkal: import, vágás (SPLIT), duplikálás, SNAP, LOOP, FIT
- Felvétel mikrofonról
- Keverő MUTE/SOLO gombokkal, panorámával, faderekkel és VU-mérőkkel
- **Sáv-FX slotok:** sávonként legfeljebb 8 effekt `.js` fájlból betöltve, be/ki kapcsolással, átrendezéssel és saját GUI-val
- **Automáció:** TOUCH felvétel és READ visszajátszás
- Projekt megnyitása / mentése / mentés másként, hang **RENDER**
- Metronóm, kvantálás, PANIC gomb

A DAWEKI-ban **nincs beépített sáveffekt**. Az EQ, a Saturation és a Widener is külső JS effekt (`daweki-fx-stock.js`).

### Effekt betöltése

Mixer → a sáv **FX** gombja → **LOAD JS…** → válaszd ki a `.js` fájlt.

- Az egy effektes fájl (`registerFx`) azonnal a sáv effektláncába kerül.
- A több effektes csomag (`registerFxPack`, pl. STOCK) az „— add effect —” listába kerül, onnan bármelyik sávhoz hozzáadható.

## DAWEKI FX MAKER: az effekttervező

- **Egyszerű mód** (alapértelmezett): válassz a 31 kész effekt közül (kompresszorok, limiter, EQ-k, dinamikus spektrum-EQ, delay, reverb, chorus, flanger, phaser, tremolo…), válassz kinézetet, írd át a potméterek nevét vagy tartományát, hallgasd meg, majd **EXPORT .JS**.
- **Haladó mód:** blokkokat kötsz össze gráfban, potmétereket vezetsz ki, és megrajzolod a saját GUI-t.
- **Channel strip:** 2–4 effektet fűzhetsz egyetlen pluginná; kész láncok: Vocal, Drum bus, Bass, Guitar/synth, Mastering.
- Az exportált JS-be a projekt is beépül, így bármelyik exportált effekt visszatölthető és szerkeszthető a MAKER-ben (**OPEN…**).

## Munkafolyamat

1. Nyisd meg a `daweki-fx-maker.html`-t, tervezz egy effektet, majd **EXPORT .JS**.
2. Nyisd meg az `index.html`-t (DAWEKI V3), és egy sávon válaszd az **FX → LOAD JS…** parancsot, majd az exportált fájlt.
3. Az effekt a projekttel együtt mentődik (`packId` + `effId` alapján).

Ha kézzel írnál effektet, olvasd el a [`DAWEKI-FX-API.md`](DAWEKI-FX-API.md) leírást, és indulj ki a `daweki-fx-example-tremolo.js` sablonból.

## Futtatás

Nyisd meg a fájlokat közvetlenül egy friss Chrome, Edge, Safari vagy Firefox böngészőben. Minden a gépeden fut, hang nem kerül ki külső szerverre.

## Előzmények

Ez a repó a korábbi `daweki_v3` és `daweki_fx_maker` repók egyesítése. Mindkettő commit-története megmaradt.
