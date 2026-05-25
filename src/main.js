import { Game } from './game.js';

if (typeof document !== 'undefined') {
  const initializeGame = () => {
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      const game = new Game(canvas);
      // Expose to window for debugging or manual console actions
      window.game = game;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame, { once: true });
  } else {
    initializeGame();
  }
}
