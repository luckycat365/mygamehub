export class PrincessInput {
  constructor(target = window) {
    this.target = target;
    this.keys = new Set();
    this.jumpQueued = false;
    this.shootQueued = false;
    this.pauseQueued = false;
    this.onKeyDown = this.handleKeyDown.bind(this);
    this.onKeyUp = this.handleKeyUp.bind(this);
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
  }

  handleKeyDown(event) {
    if (this.isGameKey(event)) event.preventDefault();
    if (!this.keys.has(event.code)) {
      if (event.code === 'ArrowUp') this.jumpQueued = true;
      if (event.code === 'Space') this.shootQueued = true;
      if (event.code === 'Escape' || event.code === 'KeyP') this.pauseQueued = true;
    }
    this.keys.add(event.code);
  }

  handleKeyUp(event) {
    this.keys.delete(event.code);
  }

  isGameKey(event) {
    return event.code === 'ArrowLeft'
      || event.code === 'ArrowRight'
      || event.code === 'ArrowUp'
      || event.code === 'Space'
      || event.code === 'Escape'
      || event.code === 'KeyP';
  }

  snapshot() {
    return {
      left: this.keys.has('ArrowLeft'),
      right: this.keys.has('ArrowRight'),
      jump: this.consumeJump(),
      shoot: this.consumeShoot(),
      pause: this.consumePause()
    };
  }

  consumeJump() {
    const queued = this.jumpQueued;
    this.jumpQueued = false;
    return queued;
  }

  consumeShoot() {
    const queued = this.shootQueued;
    this.shootQueued = false;
    return queued;
  }

  consumePause() {
    const queued = this.pauseQueued;
    this.pauseQueued = false;
    return queued;
  }

  destroy() {
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
  }
}
