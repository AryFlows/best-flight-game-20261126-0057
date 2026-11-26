// Frost Ridge Run — flight model. One clear job: move the plane, burn the fuel,
// and decide what a ridge, a ring and a runway do to it. No drawing lives here.
import { CFG } from './config.js';

export class Plane {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 260;
    this.y = 380;
    this.vx = 190;
    this.vy = 0;
    this.angle = 0;
    this.throttle = 0.55;
    this.fuel = CFG.fuelMax;
    this.damage = 0;
    this.speed = 190;
    this.alive = true;
    this.landed = false;
    this.stalled = false;
    this.onGround = false;
  }

  step(dt, input, world, time) {
    if (!this.alive || this.landed) return 'idle';

    // Throttle: W/S or Up/Down, plus mouse hold to climb toward the pointer.
    if (input.down('w', 'arrowup')) this.throttle = Math.min(1, this.throttle + dt * 0.9);
    if (input.down('s', 'arrowdown')) this.throttle = Math.max(0, this.throttle - dt * 0.9);
    if (input.mouseDown) {
      const dy = input.mouseY - this.y;
      this.angle += Math.max(-1, Math.min(1, dy / 240)) * CFG.pitchRate * dt * 0.8;
    }

    // Pitch: Left/Right arrows bank the nose up and down. Release the keys
    // and the plane eases back toward level — the ridge punishes twitch, not drift.
    const pitching = input.down('arrowleft', 'a') || input.down('arrowright', 'd');
    if (input.down('arrowleft', 'a')) this.angle -= CFG.pitchRate * dt;
    if (input.down('arrowright', 'd')) this.angle += CFG.pitchRate * dt;
    if (!pitching && !input.mouseDown) this.angle *= Math.max(0, 1 - 1.6 * dt);
    this.angle = Math.max(-0.6, Math.min(0.6, this.angle));

    // Flare: Space trades speed for a gentler descent, the landing move.
    const flare = input.down(' ') ? 0.5 : 0;

    const thrust = CFG.thrustMax * this.throttle;
    const ax = Math.cos(this.angle) * thrust - CFG.drag * this.vx + world.windAt(time);
    // Lift grows with speed: at cruise (~250 px/s) it just about holds the
    // plane level, so throttle discipline — not constant nose-up — keeps you up.
    // Angle of attack adds lift too: a nose-up slow approach holds its height
    // instead of sinking through the glide path.
    const aoaLift = Math.max(0, -Math.sin(this.angle)) * this.vx * 0.65;
    // A little vertical damping keeps the nose from porpoising: the plane
    // answers its pitch instead of swinging past it.
    const ay = Math.sin(this.angle) * thrust + CFG.gravity - CFG.lift * this.vx * 0.65 - aoaLift - flare * 260 - this.vy * 0.35;
    this.vx += ax * dt;
    this.vy += ay * dt;
    // The 40 px/s floor keeps the plane flying forward in the air — but a
    // plane rolling on a runway must be allowed to slow to a stop, or it
    // would power off the end of the strip forever.
    const onGround = this.y + 14 >= world.heightAt(this.x);
    this.vx = Math.max(onGround ? 0 : 40, Math.min(CFG.maxSpeed, this.vx));
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.speed = Math.hypot(this.vx, this.vy);
    this.stalled = this.speed < CFG.stallSpeed && this.y < 560;

    // Fuel: throttle is the burn rate; empty tanks mean a glider, not a crash.
    const burn = CFG.fuelBurnIdle + (CFG.fuelBurnFull - CFG.fuelBurnIdle) * this.throttle;
    this.fuel = Math.max(0, this.fuel - burn * dt);
    if (this.fuel <= 0) this.throttle = Math.max(0, this.throttle - dt * 0.4);

    // Ceiling and floor.
    if (this.y < 46) { this.y = 46; this.vy = Math.max(0, this.vy); }

    // Terrain: a gentle touchdown on a runway is a landing; rock is a crash.
    const ground = world.heightAt(this.x);
    if (this.y + 14 >= ground) {
      const onRunway = world.runways.some(
        (r) => this.x > r.x && this.x < r.x + r.width,
      );
      // A held flare forgives a slightly harder touchdown — the landing move.
      const limit = flare ? CFG.crashSpeed + 60 : CFG.crashSpeed;
      const soft = Math.abs(this.vy) < 150 && this.speed < limit;
      if (onRunway && soft) {
        // Touchdown: the throttle idles itself so the rollout bleeds speed
        // and the plane stops on the strip instead of powering past it.
        this.throttle = Math.min(this.throttle, 0.15);
        this.y = ground - 14;
        this.vy = 0;
        this.vx *= 1 - 2.4 * dt;
        if (this.vx < 26) {
          this.landed = true;
          this.onGround = true;
          return 'landed';
        }
        return 'rolling';
      }
      this.alive = false;
      return 'crashed';
    }

    // Rings: flying through the hoop scores, and each one feeds the combo.
    for (const ring of world.rings) {
      if (ring.passed) continue;
      const dx = this.x - ring.x;
      const dy = this.y - ring.y;
      if (Math.hypot(dx, dy) < ring.r) {
        ring.passed = true;
        return 'ring';
      }
    }

    if (this.x >= world.length - 40) {
      this.alive = false;
      return 'crashed';
    }
    return 'flying';
  }

  // Compass heading from the velocity vector: level flight is 090 (east).
  heading() {
    const deg = 90 + (Math.atan2(-this.vy, this.vx) * 180) / Math.PI;
    return Math.round(((deg % 360) + 360) % 360);
  }

  altitudeFeet() {
    return Math.max(0, Math.round((CFG.groundBase - this.y) * 2.4));
  }

  speedKnots() {
    return Math.round(this.speed * 0.62);
  }
}
