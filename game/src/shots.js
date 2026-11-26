// Frost Ridge Run — screenshots. One clear job: turn a ?shot= URL into one fixed,
// reproducible frame — title, mid-flight, or mission-complete — so the screenshots
// the entry ships are real renders of this game's own code, taken in a browser.
import { CFG } from './config.js';
import { World } from './world.js';

export function applyShot(game, startMission, finishMission) {
  const q = new URLSearchParams(window.location.search);
  const shot = q.get('shot');
  if (!shot) return null;
  const missionIndex = Number(q.get('mission') || 0);

  if (shot === 'start') {
    game.missionIndex = missionIndex;
    game.mission = CFG.missions[missionIndex];
    game.world = new World(game.mission);
    return 'start';
  }
  if (shot === 'play') {
    startMission(missionIndex);
    game.plane.fuel = 78;
    game.plane.x = 2250;
    game.plane.y = 280;
    game.plane.vx = 320;
    game.plane.throttle = 0.8;
    game.time = 42;
    // The first ring is already behind the plane, so the gold ring ahead is
    // the next one — the HUD shows a live score and combo to match.
    game.world.rings[0].passed = true;
    game.score = 1500;
    game.combo = 2;
    return 'play';
  }
  if (shot === 'end') {
    startMission(missionIndex);
    game.plane.x = game.world.runways[1].x + 200;
    game.plane.y = game.world.runways[1].y - 14;
    game.plane.vx = 20;
    game.plane.vy = 0;
    game.plane.landed = true;
    game.plane.onGround = true;
    game.time = 187;
    game.world.rings.forEach((r) => { r.passed = true; });
    game.score = 7400;
    game.combo = 0;
    finishMission(true);
    return 'end';
  }
  return null;
}
