// Frost Ridge Run — tuning constants. One clear job: every number the flight
// model, the world and the HUD agree on lives here, so a balance change is one edit.
export const CFG = {
  viewWidth: 1280,
  viewHeight: 720,
  groundBase: 620,

  // Flight model (units: pixels, seconds).
  gravity: 150,
  thrustMax: 330,
  drag: 1.0,
  lift: 0.9,
  pitchRate: 1.7,
  stallSpeed: 95,
  maxSpeed: 420,
  climbCost: 0.55,

  // Fuel and damage.
  fuelMax: 100,
  fuelBurnIdle: 0.45,
  fuelBurnFull: 1.9,
  damageMax: 100,
  crashSpeed: 260,

  // World.
  worldLength: 14000,
  ringRadius: 70,
  ringScore: 500,
  nearMissBonus: 150,
  landingBonus: 1000,

  // Near-miss scoring: skimming the ridge fast, without touching it.
  nearMissMinClearance: 14,
  nearMissMaxClearance: 46,
  nearMissMinSpeed: 300,

  // Missions: name, seed, rings, fuel, wind, goal text.
  missions: [
    {
      id: 'rings', name: 'RING RUN', seed: 7,
      rings: 12, fuel: 100, wind: 0,
      goal: 'Fly all 12 rings before the fuel runs dry.',
    },
    {
      id: 'delivery', name: 'CANYON DELIVERY', seed: 21,
      rings: 8, fuel: 100, wind: 14,
      goal: 'Thread the canyon, then land gently on the far runway.',
    },
    {
      id: 'storm', name: 'STORM RESCUE', seed: 42,
      rings: 10, fuel: 100, wind: 38,
      goal: 'Fight the storm gusts, reach the beacon, land at the rescue strip.',
    },
  ],

  // Palette: one dusk-alpine style for sky, rock, snow and instruments.
  skyTop: '#1c2f57',
  skyMid: '#7d9cc4',
  skyLow: '#f2b879',
  sun: '#ffd9a0',
  rockDark: '#3a4356',
  rockLight: '#6b7a94',
  snow: '#eef3fa',
  pine: '#1e4d33',
  pineDark: '#143626',
  river: '#7fb6d9',
  runway: '#2b2f38',
  runwayLine: '#f4f6f8',
  hudInk: '#e8f2ff',
  hudDim: '#9fb4d8',
  hudWarn: '#ff5d4d',
  hudGood: '#7dff9e',
  ringGlow: '#ffd76a',
};
