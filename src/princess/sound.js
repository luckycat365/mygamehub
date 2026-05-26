const PRINCESS_MUSIC_URL = new URL('../../assets/music/ChasingLight.mp3', import.meta.url).href;

export class PrincessSound {
  constructor() {
    this.music = null;
    this.musicVolume = 0.32;
  }

  init() {
    if (typeof Audio === 'undefined' || this.music) return;
    this.music = new Audio(PRINCESS_MUSIC_URL);
    this.music.loop = true;
    this.music.preload = 'auto';
    this.music.volume = this.musicVolume;
    if (typeof this.music.load === 'function') {
      this.music.load();
    }
  }

  playMusic() {
    this.init();
    if (this.music) {
      const playResult = this.music.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(() => {});
      }
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
}
