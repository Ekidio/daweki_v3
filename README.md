# DAWEKI V3 + DAWEKI FX MAKER

🇬🇧 English · [🇭🇺 Magyar](README.hu.md)

<img width="1710" height="900" alt="Screenshot 2026-09-26 at 20 27 49" src="https://github.com/user-attachments/assets/eab7af5f-67ea-4495-ba2f-b1211e1bf467" />
<img width="1710" height="903" alt="Screenshot 2026-09-26 at 20 25 21" src="https://github.com/user-attachments/assets/de3d53c5-c649-41f0-8b4c-78da425615e1" />



**DAWEKI V3** is a single-file, browser-based digital audio workstation (DAW) written in vanilla JavaScript and the Web Audio API.
**DAWEKI FX MAKER** is its companion tool: a single-file, browser-based effect designer that exports loadable `.js` track effects for DAWEKI.

No install, no build step and no server needed. Open the HTML file in a modern browser and start working.

## Contents

| File | Description |
|---|---|
| `index.html` | **DAWEKI V3**, the DAW (tracks, regions, mixer, automation, FX slots, render) |
| `daweki-fx-maker.html` | **DAWEKI FX MAKER**, an effect designer that exports DAWEKI `.js` effects |
| `DAWEKI-FX-API.md` | DAWEKI FX plugin API (v2) documentation (Hungarian) |
| `daweki-fx-stock.js` | **STOCK** effect pack: 5-band EQ, Saturation, Widener (M/S) |
| `daweki-fx-example-tremolo.js` | Template: a single effect with its own GUI and CSS |
| `daweki-fx-daweki_ekitronix_ala2_silver.js` | Ready-made effect exported from FX MAKER |

## DAWEKI V3: the DAW

- Multitrack arrangement with regions: import, split, duplicate, snap, loop, fit
- Microphone recording
- Mixer with mute/solo, pan, faders and VU meters
- **Track FX slots:** up to 8 effects per track, loaded from `.js` files, with on/off, reordering and custom GUIs
- **Automation:** TOUCH recording and READ playback
- Project open / save / save as, and audio **RENDER**
- Metronome, quantize, panic button

DAWEKI has **no built-in track effects**. EQ, saturation and widener are external JS effects too (`daweki-fx-stock.js`).

### Loading an effect

Mixer → the track's **FX** button → **LOAD JS…** → choose a `.js` file.

- A single-effect file (`registerFx`) goes straight into the track's effect chain.
- A multi-effect pack (`registerFxPack`, e.g. STOCK) appears in the "— add effect —" list, and you can add its effects to any track.

## DAWEKI FX MAKER: the effect designer

- **Simple mode** (default): pick one of 31 ready-made effects (compressors, limiter, EQs, dynamic spectral EQ, delay, reverb, chorus, flanger, phaser, tremolo…), choose a look, rename or re-range the knobs, audition it, then **EXPORT .JS**.
- **Advanced mode:** wire blocks together in a graph, expose parameters as knobs and draw your own GUI.
- **Channel strip:** chain 2–4 effects into a single plugin, with presets for Vocal, Drum bus, Bass, Guitar/synth and Mastering.
- The project is embedded in the exported JS, so any exported effect can be reopened and edited in the MAKER (**OPEN…**).

## Workflow

1. Open `daweki-fx-maker.html` and design an effect, then **EXPORT .JS**.
2. Open `index.html` (DAWEKI V3), then on a track use **FX → LOAD JS…** and select the exported file.
3. The effect is saved with the project (by `packId` + `effId`).

To write effects by hand, see [`DAWEKI-FX-API.md`](DAWEKI-FX-API.md) and start from `daweki-fx-example-tremolo.js`.

## Running

Open the files directly in a recent Chrome, Edge, Safari or Firefox. Everything runs on the client side and no audio leaves your computer.

## History

This repository combines the former `daweki_v3` and `daweki_fx_maker` repositories. The commit history of both is preserved.
