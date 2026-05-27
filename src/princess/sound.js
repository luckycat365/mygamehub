const PRINCESS_MUSIC_URL = new URL('../../assets/music/ChasingLight.mp3', import.meta.url).href;
const STAR_ATTACK_URL = new URL('../../assets/sounds/PrincessStarAdventure/star-attack.wav', import.meta.url).href;
const TEACUP_CRASH_URL = new URL('../../assets/sounds/PrincessStarAdventure/teacup-crash.wav', import.meta.url).href;
const PRINCESS_DOUBLE_JUMP_URL = new URL('../../assets/sounds/PrincessStarAdventure/princess double jump.wav', import.meta.url).href;

export class PrincessSound {
  constructor() {
    this.music = null;
    this.musicVolume = 0.32;
    this.starAttack = null;
    this.teacupCrash = null;
    this.doubleJump = null;
    this.sfxVolume = 0.5;
  }

  init() {
    if (typeof Audio === 'undefined') return;

    if (!this.music) {
      this.music = new Audio(PRINCESS_MUSIC_URL);
      this.music.loop = true;
      this.music.preload = 'auto';
      this.music.volume = this.musicVolume;
      if (typeof this.music.load === 'function') {
        this.music.load();
      }
    }

    if (!this.starAttack) {
      this.starAttack = new Audio(STAR_ATTACK_URL);
      this.starAttack.preload = 'auto';
      this.starAttack.volume = this.sfxVolume;
      if (typeof this.starAttack.load === 'function') {
        this.starAttack.load();
      }
    }

    if (!this.teacupCrash) {
      this.teacupCrash = new Audio(TEACUP_CRASH_URL);
      this.teacupCrash.preload = 'auto';
      this.teacupCrash.volume = this.sfxVolume;
      if (typeof this.teacupCrash.load === 'function') {
        this.teacupCrash.load();
      }
    }

    if (!this.doubleJump) {
      this.doubleJump = new Audio(PRINCESS_DOUBLE_JUMP_URL);
      this.doubleJump.preload = 'auto';
      this.doubleJump.volume = this.sfxVolume;
      if (typeof this.doubleJump.load === 'function') {
        this.doubleJump.load();
      }
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

  playStarAttack() {
    this.init();
    if (!this.starAttack) return;

    this.starAttack.currentTime = 0;
    this.starAttack.volume = this.sfxVolume;
    const playResult = this.starAttack.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(() => {});
    }
  }

  playTeacupCrash() {
    this.init();
    if (!this.teacupCrash) return;

    this.teacupCrash.currentTime = 0;
    this.teacupCrash.volume = this.sfxVolume;
    const playResult = this.teacupCrash.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(() => {});
    }
  }

  playDoubleJump() {
    this.init();
    if (!this.doubleJump) return;

    this.doubleJump.currentTime = 0;
    this.doubleJump.volume = this.sfxVolume;
    const playResult = this.doubleJump.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(() => {});
    }
  }
}
