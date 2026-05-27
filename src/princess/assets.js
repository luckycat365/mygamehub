export const ASSET_ROOT = '../../assets/images/PrincessStarAdventure';
export const PRINCESS_ASSET_VERSION = 'princess-mobile-stability';

const framePaths = (folder) => Array.from({ length: 6 }, (_, index) => (
  `princess/${folder}/${String(index + 1).padStart(2, '0')}.png`
));

const enemyFramePaths = (folder, count) => Array.from({ length: count }, (_, index) => (
  `enemies/teacup-sentry/${folder}/${String(index + 1).padStart(2, '0')}.png`
));

export const PRINCESS_ASSET_PATHS = {
  background: 'backgrounds/fantasy-sky-background.png',
  castle: 'castle/castle.png',
  projectile: 'projectiles/star/star-projectile.png',
  princess: {
    standing: framePaths('standing'),
    running: framePaths('running'),
    jumping: framePaths('jumping'),
    attacking: framePaths('attacking')
  },
  enemy: {
    walking: enemyFramePaths('walking', 6),
    hit: enemyFramePaths('hit', 1),
    destroyed: enemyFramePaths('destroyed', 1)
  },
  platforms: {
    'grass-short': 'platforms/fantasy/grass-short.png',
    'grass-round': 'platforms/fantasy/grass-round.png',
    'grass-long': 'platforms/fantasy/grass-long.png',
    'flower-bridge': 'platforms/fantasy/flower-bridge.png',
    cloud: 'platforms/fantasy/cloud.png',
    crystal: 'platforms/fantasy/crystal.png'
  }
};

export const assetUrl = (path) => (
  `${new URL(`${ASSET_ROOT}/${path}`, import.meta.url).href}?v=${PRINCESS_ASSET_VERSION}`
);

const loadImage = (path) => new Promise((resolve, reject) => {
  const image = new Image();
  image.decoding = 'async';
  image.onload = () => {
    const decode = typeof image.decode === 'function'
      ? image.decode()
      : Promise.resolve();

    decode.then(() => resolve(image)).catch((error) => {
      const hasUsableBitmap = image.complete && image.naturalWidth !== 0;
      if (hasUsableBitmap) {
        resolve(image);
      } else {
        reject(error);
      }
    });
  };
  image.onerror = () => reject(new Error(`Failed to load image: ${path}`));
  image.src = assetUrl(path);
});

const loadFrames = async (paths) => Promise.all(paths.map(loadImage));

export async function loadPrincessAssets() {
  const [background, castle, projectile] = await Promise.all([
    loadImage(PRINCESS_ASSET_PATHS.background),
    loadImage(PRINCESS_ASSET_PATHS.castle),
    loadImage(PRINCESS_ASSET_PATHS.projectile)
  ]);

  const princessEntries = await Promise.all(
    Object.entries(PRINCESS_ASSET_PATHS.princess).map(async ([name, paths]) => [name, await loadFrames(paths)])
  );
  const enemyEntries = await Promise.all(
    Object.entries(PRINCESS_ASSET_PATHS.enemy).map(async ([name, paths]) => [name, await loadFrames(paths)])
  );
  const platformEntries = await Promise.all(
    Object.entries(PRINCESS_ASSET_PATHS.platforms).map(async ([name, path]) => [name, await loadImage(path)])
  );

  return {
    background,
    castle,
    projectile,
    princess: Object.fromEntries(princessEntries),
    enemy: Object.fromEntries(enemyEntries),
    platforms: Object.fromEntries(platformEntries)
  };
}
