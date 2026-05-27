import { PrincessGame } from './princess/game.js?v=princess-mobile-stability';

if (typeof document !== 'undefined') {
  const initializePrincessGame = () => {
    const canvas = document.getElementById('princess-canvas');
    if (canvas) {
      const game = new PrincessGame(canvas);
      window.princessGame = game;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePrincessGame, { once: true });
  } else {
    initializePrincessGame();
  }
}
