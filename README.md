# Sol del Mar

[![make.fun bounty](https://img.shields.io/badge/make.fun-gta6--01-f4a700?style=flat-square)](https://make.fun/bounty/gta6-01)
[![Three.js r170](https://img.shields.io/badge/Three.js-r170-24d6c4?style=flat-square)](#architecture)
[![Offline Static](https://img.shields.io/badge/runtime-100%25%20offline-37d67a?style=flat-square)](#running--building)

**Sol del Mar** is a 3D sun-soaked coastal open-world crime action game built from scratch with Three.js ES modules and procedural Web Audio. Explore eight distinct coastal districts—from the pastel beachfront resorts of **Miramar Beach** and **Bahia Marina** to **Solis Downtown**, **Las Palmas Hills**, and **Puerto Dorado**—completely offline in any modern desktop browser.

## Features

- **Procedural Coastal Metropolis**: Seeded grid road network, intersection traffic signals, swaying palms, golden beach shoreline, elevated wooden marina piers, shipping cranes, dynamic LOD skyscrapers, and a full 24-hour day/night cycle.
- **Land & Sea Vehicles**: Six vehicle classes (`Solara Sedan`, `Mirage GT`, `Costa 4x4`, `Dorado Hauler`, `Viento 900` motorcycle, and `Mako Interceptor` speedboat) plus `Patrulla Cruiser` interceptors, with drift physics, night headlights, and panel deformation.
- **Third-Person Combat & Pedestrians**: Five weapon slots (`Unarmed`, `Solis 9mm`, `Costa Pump`, `Brisa SMG`, `Dorado Carbine`), precision aiming, drive-by fire, ambient sidewalk crowds, and collectible world pickups.
- **1–5 Star Patrulla Heat System**: Escalating foot patrols, siren-lit cruisers, multi-car avenue roadblocks, line-of-sight evasion cooldowns, and close-quarters detainment.
- **8-Mission Story Campaign**: Launch contracts in the open world or from the **Casa del Sol** safehouse board, with full offline `localStorage` save/load support.
- **100% Procedural Audio & FX**: Synthesized multi-oscillator engine roar, tire screech, police wail/yelp sirens, weapon gunfire, sub-bass explosions, and coastal surf ambience via the Web Audio API.

## Controls

| Input | Action |
| --- | --- |
| `W A S D` / Arrow Keys | Walk, swim, throttle, brake & steer |
| `Mouse` | 360° camera orbit & aiming |
| `Left Click` / `J` | Fire weapon / melee / drive-by |
| `Right Click` / `Q` | Precision shoulder aim |
| `E` | Enter / exit vehicle or open safehouse / contract |
| `Space` | Jump on foot / drift handbrake in vehicle |
| `Shift` / `F` | Sprint |
| `1`–`5` / `Tab` / Wheel | Switch weapons |
| `V` / `C` | Cycle camera preset (`standard`, `close`, `cinematic`) |
| `M` | Toggle audio mute |
| `Esc` / `P` | Pause & Casa del Sol Safehouse menu |

## Running & Building

Serve the static game locally on `http://localhost:8080`:

```bash
node serve.ts
```

Generate the submission bundle (`game/`, `screenshots/`, and `dossier.json`):

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Deterministic screenshot presets can be staged directly via `?shot=chase`, `?shot=onfoot`, `?shot=combat`, or `?shot=title`.
