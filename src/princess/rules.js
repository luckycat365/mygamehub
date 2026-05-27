import { checkCollision } from '../physics.js?v=princess-mobile-stability';

export const playerTouchedEnemy = (player, enemy) => {
  if (enemy.destroyed) return false;
  return checkCollision(player.getBounds(), enemy.getBounds());
};

export const playerReachedCastle = (player, castle) => {
  const castleBounds = castle.bounds || castle;
  return checkCollision(player.getBounds(), castleBounds);
};
