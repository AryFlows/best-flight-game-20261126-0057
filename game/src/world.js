// Frost Ridge Run — world. One clear job: build one deterministic alpine valley
// from a seed — ridge heights, the runway strips, the rings, the pines, the river
// and the drifting clouds — so every mission and every screenshot is reproducible.
import { CFG } from './config.js';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ridgeNoise(x, seed) {
  // Smooth ridge profile: two slow sines plus a wobble, all seeded.
  const s1 = Math.sin(x * 0.00042 + seed * 1.7);
  const s2 = Math.sin(x * 0.00113 + seed * 0.6);
  const s3 = Math.sin(x * 0.00310 + seed * 2.3);
  return s1 * 0.55 + s2 * 0.3 + s3 * 0.15;
}

export class World {
  constructor(mission) {
    this.mission = mission;
    this.random = mulberry32(mission.seed);
    this.length = CFG.worldLength;
    this.step = 24;
    this.heights = [];
    this.buildHeights();
    this.buildRunways();
    this.buildRings();
    this.buildTrees();
    this.buildClouds();
    this.buildBirds();
  }

  buildHeights() {
    const n = Math.ceil(this.length / this.step) + 2;
    for (let i = 0; i < n; i++) {
      const x = i * this.step;
      const base = CFG.groundBase - 40;
      const h = base + ridgeNoise(x, this.mission.seed) * 110;
      this.heights.push(h);
    }
    // Flatten the ground under all three runways so landings are fair, with a
    // long flat approach before the far strip — a ridge in the glide path
    // would make the landing itself impossible, not just hard.
    for (const r of [
      { at: 420, before: 12, after: 12 },
      { at: 7000, before: 30, after: 20 },
      { at: this.length - 700, before: 50, after: 30 },
    ]) {
      const c = Math.floor(r.at / this.step);
      const flat = this.heights[c];
      for (let i = c - r.before; i <= c + r.after; i++) {
        if (i >= 0 && i < this.heights.length) this.heights[i] = flat;
      }
    }
  }

  heightAt(x) {
    const i = Math.max(0, Math.min(this.heights.length - 2, Math.floor(x / this.step)));
    const t = (x - i * this.step) / this.step;
    return this.heights[i] * (1 - t) + this.heights[i + 1] * t;
  }

  buildRunways() {
    this.runways = [
      { x: 120, y: this.heightAt(420), width: 620, label: 'FROST FIELD' },
      { x: 6700, y: this.heightAt(7000), width: 800, label: 'RIDGE STRIP' },
      { x: this.length - 1020, y: this.heightAt(this.length - 700), width: 900, label: 'RESCUE STRIP' },
    ];
  }

  buildRings() {
    this.rings = [];
    const count = this.mission.rings;
    const spanStart = 1500;
    const spanEnd = this.length - 1600;
    for (let i = 0; i < count; i++) {
      const t = i / Math.max(1, count - 1);
      const x = spanStart + (spanEnd - spanStart) * t;
      const ground = this.heightAt(x);
      // Rings hang in the air above the ridge, at varied heights — never
      // inside the rock, never all on one flat line.
      const y = Math.max(120, Math.min(420, ground - 140 - this.random() * 200));
      this.rings.push({ x, y, r: CFG.ringRadius, passed: false });
    }
  }

  buildTrees() {
    this.trees = [];
    for (let x = 60; x < this.length; x += 34) {
      if (this.random() < 0.62) {
        const ground = this.heightAt(x);
        const h = 26 + this.random() * 30;
        this.trees.push({ x, y: ground, h, dark: this.random() < 0.5 });
      }
    }
  }

  buildClouds() {
    this.clouds = [];
    for (let i = 0; i < 16; i++) {
      this.clouds.push({
        x: this.random() * this.length,
        y: 40 + this.random() * 180,
        w: 120 + this.random() * 220,
        speed: 6 + this.random() * 14,
      });
    }
  }

  buildBirds() {
    // A few alpine choughs circling the valley — ambient life, never obstacles.
    this.birds = [];
    for (let i = 0; i < 7; i++) {
      this.birds.push({
        x: this.random() * this.length,
        y: 140 + this.random() * 220,
        phase: this.random() * Math.PI * 2,
        speed: 24 + this.random() * 18,
      });
    }
  }

  // Wind gusts for the storm mission: smooth, time-varying push.
  windAt(time) {
    const w = this.mission.wind;
    if (!w) return 0;
    return w * (Math.sin(time * 0.7) * 0.6 + Math.sin(time * 1.9 + 2) * 0.4);
  }
}
