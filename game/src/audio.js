// Frost Ridge Run — sound. One clear job: synthesised WebAudio only — an engine
// hum that follows the throttle, a ring chime, a landing thump and a crash.
// No audio files, no network, and silence until the player first presses a key.
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.muted = false;
  }

  ensure() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.value = 70;
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 320;
      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    } catch (err) {
      this.ctx = null;
    }
  }

  setEngine(throttle, speed) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(55 + throttle * 90 + speed * 0.08, t, 0.1);
    this.engineGain.gain.setTargetAtTime(this.muted ? 0 : 0.045 + throttle * 0.05, t, 0.1);
  }

  blip(freq, dur, type, vol) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol || 0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  ring() {
    this.blip(880, 0.35, 'sine', 0.16);
    setTimeout(() => this.blip(1318, 0.4, 'sine', 0.12), 70);
  }

  thump() {
    this.blip(90, 0.3, 'triangle', 0.2);
  }

  landed() {
    // A small two-note arrival chime for a good landing.
    this.blip(523, 0.25, 'sine', 0.14);
    setTimeout(() => this.blip(784, 0.35, 'sine', 0.12), 90);
  }

  crash() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    noise.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    noise.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.engineGain) {
      this.engineGain.gain.value = this.muted ? 0 : 0.06;
    }
    return this.muted;
  }
}
