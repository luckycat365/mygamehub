const LANDING_MUSIC_UNLOCK_KEY = 'landing_music_unlocked';

if (typeof document !== 'undefined') {
  const initializeDummyCards = () => {
    document.querySelectorAll('[data-dummy-card]').forEach((card) => {
      card.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
    });
  };

  const initializeLandingMusic = () => {
    const landingMusic = document.getElementById('landing-music');
    if (!landingMusic) return;

    landingMusic.volume = 0.35;

    let unlocked = false;

    try {
      unlocked = window.sessionStorage.getItem(LANDING_MUSIC_UNLOCK_KEY) === 'true';
    } catch {
      unlocked = false;
    }

    const markUnlocked = () => {
      unlocked = true;
      try {
        window.sessionStorage.setItem(LANDING_MUSIC_UNLOCK_KEY, 'true');
      } catch {}
    };

    const startPlayback = () => {
      landingMusic.play().then(() => {
        detachInteractionListeners();
      }).catch(() => {});
    };

    const unlockAndPlay = () => {
      markUnlocked();
      startPlayback();
    };

    function detachInteractionListeners() {
      window.removeEventListener('pointerdown', unlockAndPlay);
      window.removeEventListener('keydown', unlockAndPlay);
      window.removeEventListener('touchstart', unlockAndPlay);
      window.removeEventListener('mousedown', unlockAndPlay);
    }

    landingMusic.addEventListener('canplay', () => {
      if (unlocked || document.visibilityState === 'visible') {
        startPlayback();
      }
    });

    window.addEventListener('pageshow', startPlayback);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        startPlayback();
      }
    });

    window.addEventListener('pointerdown', unlockAndPlay);
    window.addEventListener('keydown', unlockAndPlay);
    window.addEventListener('touchstart', unlockAndPlay);
    window.addEventListener('mousedown', unlockAndPlay);

    startPlayback();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeDummyCards();
      initializeLandingMusic();
    }, { once: true });
  } else {
    initializeDummyCards();
    initializeLandingMusic();
  }
}
