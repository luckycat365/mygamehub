export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.music = null;
    this.musicGain = null;
    this.musicSource = null;
  }

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioContextClass = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (typeof Audio !== 'undefined' && !this.music) {
      this.music = new Audio('assets/music/AP.mp3');
      this.music.loop = true;
      if (this.ctx) {
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.muted ? 0 : 0.3, this.ctx.currentTime);
        this.musicSource = this.ctx.createMediaElementSource(this.music);
        this.musicSource.connect(this.musicGain);
        this.musicGain.connect(this.ctx.destination);
      }
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.musicGain) {
      const now = this.ctx ? this.ctx.currentTime : 0;
      this.musicGain.gain.setValueAtTime(this.muted ? 0 : 0.3, now);
    }
    return this.muted;
  }

  playMusic() {
    this.init();
    if (this.music) {
      this.music.play().catch(err => {
        console.warn('BGM play blocked or failed:', err);
      });
    }
  }

  pauseMusic() {
    if (this.music) {
      this.music.pause();
    }
  }

  stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
    }
  }

  playJump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start();
    osc.stop(now + 0.15);
  }

  playCollect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.setValueAtTime(900, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.start();
    osc.stop(now + 0.12);
  }

  playPowerUp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.3);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.start();
    osc.stop(now + 0.35);
  }

  playHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    // Generate low frequency boom/noise
    const bufferSize = this.ctx.sampleRate * 0.25; // 0.25s duration
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // White noise
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Filter to make it a deep crash
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.Q.value = 1.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseNode.start();
    noiseNode.stop(this.ctx.currentTime + 0.25);
  }
}
