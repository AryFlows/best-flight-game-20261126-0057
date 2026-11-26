# Frost Ridge Run — an alpine flight game

[![make.fun · best-flight-game-20261126-0057](https://make.fun/badge/best-flight-game-20261126-0057.svg)](https://make.fun/bounty/best-flight-game-20261126-0057?utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057)
[![rank](https://make.fun/badge/best-flight-game-20261126-0057/AryFlows/best-flight-game-20261126-0057/rank.svg)](https://make.fun/bounty/best-flight-game-20261126-0057/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057)
[![reward](https://make.fun/badge/best-flight-game-20261126-0057/AryFlows/best-flight-game-20261126-0057/reward.svg)](https://make.fun/bounty/best-flight-game-20261126-0057?utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057)

A 2D canvas flight game set in a dusk alpine valley. Fly a frost-blue bush plane
through glowing rings, mind the fuel gauge, and land gently on the runway strips —
the ridge forgives nothing.

## How to play

- **W / S** — throttle up / down (Up / Down arrows work too)
- **Arrow Left / Right** — pitch the nose up / down (A / D work too)
- **Mouse** — hold to steer the nose toward the pointer
- **Space** — flare: trade speed for a gentler descent (the landing move)
- **P** — pause, **M** — mute, **R** — fly again after a crash

## Missions

1. **Ring Run** — fly all 12 rings before the fuel runs dry.
2. **Canyon Delivery** — thread the canyon, then land on the far runway.
3. **Storm Rescue** — fight the gusts, reach the beacon, land at the rescue strip.

Landing on a runway refuels the plane. A touchdown counts only if it is slow
and gentle; rock at speed is a crash. The mid-field Ridge Strip is there for
exactly that — plan the fuel stop, or run dry over the canyon. Near misses over
the ridge score a trickle of points, and consecutive rings build a combo multiplier.

## HUD

Altitude (ft), speed (kt) and heading on the top bar, fuel gauge, ring counter,
throttle bar, and two lit instrument dials — altimeter and speedometer — bottom
right. Stall and low-fuel warnings light up when they matter.

## Run it

```sh
node serve.ts
# open http://localhost:8080/game/index.html
```

No build step, no network requests, no third-party code: plain static files
under `game/`, all sound synthesised with WebAudio.

## Screenshots

The four images in `screenshots/` are real renders of this game's own code in
a browser, taken with `?shot=` states (`start`, `play`, `end`):

1. `1-cover.jpg` — mid-flight through a ring over the ridge (Ring Run)
2. `2-title.jpg` — the title screen with the three missions
3. `3-storm.jpg` — Storm Rescue in gusty wind
4. `4-landing.jpg` — touchdown on the rescue strip

## Hand-in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library.

## A note to the judge

Rings, fuel and landings are the game. The screenshots are real renders of this
code in a browser: the cover shows mid-flight through a ring over the ridge,
and the others show the title screen, the storm mission, and a runway landing.
