import { WORLD_WIDTH } from './constants.js?v=princess-mobile-stability';

const platform = (x, y, width, type) => ({
  x,
  y,
  width,
  height: type === 'grass-long' ? 22 : 20,
  type
});

const makeLevelPlatforms = () => {
  const platforms = [
    platform(0, 425, 560, 'grass-long')
  ];

  const mainTypes = [
    'grass-short',
    'flower-bridge',
    'grass-long',
    'cloud',
    'grass-long',
    'flower-bridge',
    'grass-short',
    'grass-long'
  ];
  const mainYs = [418, 392, 424, 372, 404, 354, 388, 426, 368, 398, 346, 414];
  const widths = [360, 320, 390, 300, 420, 340, 310, 380, 330, 400];
  const gaps = [95, 130, 224, 110, 145, 238, 90, 165, 214, 115, 140, 248];

  let step = 0;
  while (platforms[platforms.length - 1].x + platforms[platforms.length - 1].width < WORLD_WIDTH - 1060) {
    const previous = platforms[platforms.length - 1];
    const width = widths[step % widths.length];
    const gap = gaps[step % gaps.length];
    const x = previous.x + previous.width + gap;
    if (x + width > WORLD_WIDTH - 900) break;

    platforms.push(platform(
      x,
      mainYs[step % mainYs.length],
      width,
      mainTypes[step % mainTypes.length]
    ));
    step += 1;
  }

  while (WORLD_WIDTH - 700 - (platforms[platforms.length - 1].x + platforms[platforms.length - 1].width) > 270) {
    const previous = platforms[platforms.length - 1];
    const remaining = WORLD_WIDTH - 700 - (previous.x + previous.width);
    const gap = Math.min(210, Math.max(150, remaining - 360));
    platforms.push(platform(
      previous.x + previous.width + gap,
      mainYs[step % mainYs.length],
      330,
      mainTypes[step % mainTypes.length]
    ));
    step += 1;
  }

  const finalPrevious = platforms[platforms.length - 1];
  const finalPreviousEnd = finalPrevious.x + finalPrevious.width;
  const finalGap = Math.min(210, Math.max(170, WORLD_WIDTH - 700 - finalPreviousEnd));
  const finalX = finalPreviousEnd + finalGap;
  platforms.push(platform(finalX, 425, WORLD_WIDTH - finalX, 'grass-long'));

  return platforms;
};

const makeLevelEnemies = (platforms) => {
  const enemies = [];

  platforms.forEach((item, index) => {
    const isCastleApproach = item.x > WORLD_WIDTH - 900;
    if (index < 3 || isCastleApproach || item.width < 220) return;
    if (index % 8 === 1) return;

    const patrolPadding = Math.min(48, item.width * 0.18);
    enemies.push({
      x: item.x + item.width * 0.48,
      platformIndex: index,
      patrolMin: item.x + patrolPadding,
      patrolMax: item.x + item.width - patrolPadding - 58
    });
  });

  return enemies;
};

const platforms = makeLevelPlatforms();

export const LEVEL = {
  width: WORLD_WIDTH,
  start: { x: 80, y: 315 },
  castle: {
    x: WORLD_WIDTH - 330,
    y: 278,
    width: 250,
    height: 180,
    bounds: { x: WORLD_WIDTH - 268, y: 328, width: 112, height: 130 }
  },
  platforms,
  enemies: makeLevelEnemies(platforms)
};
