// Frost Ridge Run — input. One clear job: turn keyboard and mouse into a small,
// stable snapshot the flight model reads every frame. No game logic lives here.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this.pressed = new Set();
    this.canvas = canvas;

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (!e.repeat) this.pressed.add(e.key.toLowerCase());
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.mouseDown = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouseX = ((e.clientX - r.left) / r.width) * 1280;
      this.mouseY = ((e.clientY - r.top) / r.height) * 720;
    });
    canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.mouseDown = true;
      this.pressed.add('mouse');
    });
    window.addEventListener('mouseup', () => { this.mouseDown = false; });
    // Touch: one finger steers the nose toward the touch point, like the mouse.
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      const r = canvas.getBoundingClientRect();
      this.mouseX = ((t.clientX - r.left) / r.width) * 1280;
      this.mouseY = ((t.clientY - r.top) / r.height) * 720;
      this.mouseDown = true;
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      const r = canvas.getBoundingClientRect();
      this.mouseX = ((t.clientX - r.left) / r.width) * 1280;
      this.mouseY = ((t.clientY - r.top) / r.height) * 720;
    }, { passive: false });
    canvas.addEventListener('touchend', () => { this.mouseDown = false; });
  }

  down(...names) {
    return names.some((n) => this.keys.has(n));
  }

  // True once, on the frame the key went down; consumed by the caller.
  wasPressed(...names) {
    for (const n of names) {
      if (this.pressed.has(n)) return true;
    }
    return false;
  }

  endFrame() {
    this.pressed.clear();
  }
}
