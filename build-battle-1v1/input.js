export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouse = { dx: 0, dy: 0 };
    this.pointerLocked = false;
    this.placeRequested = false;
    this.handlers = [];
  }

  bind() {
    const keyDown = e => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ShiftLeft", "ShiftRight"].includes(e.code)) e.preventDefault();
      this.keys.add(e.code);
    };
    const keyUp = e => this.keys.delete(e.code);
    const mouseMove = e => {
      if (!this.pointerLocked) return;
      this.mouse.dx += e.movementX;
      this.mouse.dy += e.movementY;
    };
    const pointer = () => this.pointerLocked = document.pointerLockElement === this.canvas;
    const click = e => {
      if (document.pointerLockElement !== this.canvas) this.canvas.requestPointerLock();
      if (e.button === 0) this.placeRequested = true;
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("mousemove", mouseMove);
    document.addEventListener("pointerlockchange", pointer);
    this.canvas.addEventListener("mousedown", click);
    this.handlers = [
      [window, "keydown", keyDown],
      [window, "keyup", keyUp],
      [window, "mousemove", mouseMove],
      [document, "pointerlockchange", pointer],
      [this.canvas, "mousedown", click]
    ];
  }

  pressed(code) {
    return this.keys.has(code);
  }

  consumeMouse() {
    const out = { ...this.mouse };
    this.mouse.dx = 0;
    this.mouse.dy = 0;
    return out;
  }

  consumePlace() {
    const requested = this.placeRequested;
    this.placeRequested = false;
    return requested;
  }

  dispose() {
    this.handlers.forEach(([target, event, handler]) => target.removeEventListener(event, handler));
  }
}
