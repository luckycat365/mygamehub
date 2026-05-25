if (typeof document !== 'undefined') {
  const initializeLandingMusic = () => {
    const landingMusic = document.getElementById('landing-music');
    if (!landingMusic) return;

    landingMusic.volume = 0.35;

    const startPlayback = () => {
      landingMusic.play().then(() => {
        window.removeEventListener('pointerdown', startPlayback);
        window.removeEventListener('keydown', startPlayback);
      }).catch(() => {});
    };

    startPlayback();
    window.addEventListener('pointerdown', startPlayback, { once: true });
    window.addEventListener('keydown', startPlayback, { once: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLandingMusic, { once: true });
  } else {
    initializeLandingMusic();
  }
}
