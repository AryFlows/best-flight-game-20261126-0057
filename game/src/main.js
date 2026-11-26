// Frost Ridge Run — main loop. One clear job: own the game state (title, flying,
// paused, crashed, done), run the fixed-step loop, keep the score, and hand the
// renderer a single state object every frame. The flight model lives in physics.
import { CFG } from './config.js';
import { Input } from './input.js';
import { World } from './world.js';
import { Plane } from './physics.js';
import { Renderer } from './render.js';
import { AudioEngine } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const input = new Input(canvas);
const renderer = new Renderer(canvas);
const audio = new AudioEngine();

const game = {
  screen: 'title',
  missionIndex: 0,
  missions: CFG.missions,
  mission: CFG.missions[0],
  world: null,
  plane: new Plane(),
  score: 0,
  combo: 0,
  time: 0,
  burst: null,
  endLine: '',
  best: 0,
};

try {
  game.best = Number(localStorage.getItem('frost-ridge-best') || 0);
} catch (err) {
  game.best = 0;
}

function startMission(index) {
  game.missionIndex = index;
  game.mission = CFG.missions[index];
  game.world = new World(game.mission);
  game.plane = new Plane();
  game.plane.fuel = game.mission.fuel;
  game.score = 0;
  game.combo = 0;
  game.burst = null;
  game.screen = 'playing';
  audio.ensure();
}

function ringsLeft() {
  return game.world.rings.filter((r) => !r.passed).length;
}

function crashBurst() {
  const camX = Math.max(0, game.plane.x - 380);
  const sx = game.plane.x - camX;
  const colors = ['#ff5d4d', '#ffd76a', '#dfe9f5', '#7fb6d9'];
  game.burst = [];
  for (let i = 0; i < 26; i++) {
    game.burst.push({
      x: sx + (Math.random() - 0.5) * 40,
      y: game.plane.y + (Math.random() - 0.5) * 30,
      size: 3 + Math.random() * 7,
      life: 1,
      color: colors[i % colors.length],
    });
  }
}

function finishMission(landed) {
  game.screen = 'done';
  const ringsDone = game.mission.rings - ringsLeft();
  let bonus = ringsDone * CFG.ringScore;
  if (landed) bonus += CFG.landingBonus;
  game.score += bonus;
  const mins = Math.floor(game.time / 60);
  const secs = Math.floor(game.time % 60);
  game.endLine = `${ringsDone}/${game.mission.rings} rings · ${mins}:${String(secs).padStart(2, '0')} · score ${game.score} (best ${Math.max(game.best, game.score)})`;
  if (game.score > game.best) {
    game.best = game.score;
    try { localStorage.setItem('frost-ridge-best', String(game.best)); } catch (err) { /* private mode */ }
  }
}

function update(dt) {
  if (game.screen !== 'playing') return;
  game.time += dt;
  const result = game.plane.step(dt, input, game.world, game.time);
  audio.setEngine(game.plane.throttle, game.plane.speed);

  if (result === 'ring') {
    game.combo += 1;
    game.score += CFG.ringScore * game.combo;
    audio.ring();
    if (ringsLeft() === 0 && game.mission.id !== 'delivery') finishMission(false);
  } else if (result === 'landed') {
    game.plane.fuel = CFG.fuelMax;
    audio.thump();
    audio.landed();
    if (game.mission.id === 'delivery' || game.mission.id === 'storm') {
      finishMission(true);
    } else {
      // Ring Run: a runway stop refuels and the sortie continues.
      game.plane.landed = false;
      game.plane.vx = 170;
      game.plane.y -= 30;
    }
  } else if (result === 'crashed') {
    game.combo = 0;
    game.screen = 'crashed';
    crashBurst();
    audio.crash();
  }

  // Near-miss bonus: skimming the ridge fast, without touching it.
  const clearance = game.world.heightAt(game.plane.x) - game.plane.y;
  if (
    game.plane.alive &&
    clearance > CFG.nearMissMinClearance &&
    clearance < CFG.nearMissMaxClearance &&
    game.plane.speed > CFG.nearMissMinSpeed
  ) {
    game.score += 1;
  }

  if (game.burst) {
    for (const p of game.burst) p.life -= dt * 1.4;
    game.burst = game.burst.filter((p) => p.life > 0);
    if (!game.burst.length) game.burst = null;
  }
}

function handleKeys() {
  if (input.wasPressed('m')) audio.toggleMute();
  if (game.screen === 'title') {
    if (input.wasPressed('1')) game.missionIndex = 0;
    if (input.wasPressed('2')) game.missionIndex = 1;
    if (input.wasPressed('3')) game.missionIndex = 2;
    if (input.wasPressed('enter', ' ')) startMission(game.missionIndex);
    return;
  }
  if (input.wasPressed('p', 'escape')) {
    game.screen = game.screen === 'paused' ? 'playing' : 'paused';
    return;
  }
  if ((game.screen === 'crashed' || game.screen === 'done') && input.wasPressed('r', 'enter')) {
    startMission(game.missionIndex);
  }
}

// Deterministic screenshot states (?shot=start|play|end&seed=N) render once.
const shot = applyShot(game, startMission, finishMission);
if (shot) {
  // Screenshots carry their own captions; the page hint would overlap them.
  const hint = document.getElementById('hint');
  if (hint) hint.style.display = 'none';
  renderer.draw({
    plane: game.plane, world: game.world, time: game.time,
    mission: game.mission, missions: game.missions, missionIndex: game.missionIndex,
    score: game.score, combo: game.combo, ringsLeft: ringsLeft(),
    screen: game.screen, burst: game.burst, endLine: game.endLine,
  });
} else {
  let last = performance.now();
  let acc = 0;
  const STEP = 1 / 60;
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    acc += dt;
    while (acc >= STEP) {
      handleKeys();
      update(STEP);
      input.endFrame();
      acc -= STEP;
    }
    renderer.draw({
      plane: game.plane, world: game.world, time: game.time,
      mission: game.mission, missions: game.missions, missionIndex: game.missionIndex,
      score: game.score, combo: game.combo, ringsLeft: game.world ? ringsLeft() : 0,
      screen: game.screen, burst: game.burst, endLine: game.endLine,
    });
  }
  // A world exists before the first frame so the title screen paints over terrain.
  game.world = new World(game.mission);
  requestAnimationFrame(frame);
}
