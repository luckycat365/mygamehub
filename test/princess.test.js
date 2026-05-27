import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assetUrl, loadPrincessAssets, PRINCESS_ASSET_PATHS } from '../src/princess/assets.js';
import { LEVEL } from '../src/princess/level.js';
import { TeacupSentry } from '../src/princess/enemy.js';
import { PrincessInput } from '../src/princess/input.js';
import { PrincessPlayer } from '../src/princess/player.js';
import { playerReachedCastle, playerTouchedEnemy } from '../src/princess/rules.js';

const repoRoot = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const assetRoot = path.join(repoRoot, 'assets', 'images', 'PrincessStarAdventure');

const flattenAssetPaths = (value) => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(flattenAssetPaths);
  return Object.values(value).flatMap(flattenAssetPaths);
};

test('Princess Star Adventure mechanics', async (t) => {
  await t.test('combines jump and horizontal movement', () => {
    const player = new PrincessPlayer(100, 114);
    player.onGround = true;
    player.update(
      { left: false, right: true, jump: true },
      [{ x: 0, y: 200, width: 400, height: 20 }],
      0.016,
      1000
    );

    assert.ok(player.x > 100);
    assert.ok(player.vy < 0);
    assert.strictEqual(player.facing, 1);
  });

  await t.test('snaps back to platform after a tiny resume drift', () => {
    const player = new PrincessPlayer(100, 117);
    player.vy = 0;
    player.onGround = false;
    player.update(
      { left: false, right: false, jump: false },
      [{ x: 0, y: 200, width: 400, height: 20 }],
      0.016,
      1000
    );

    assert.strictEqual(player.y, 114);
    assert.strictEqual(player.vy, 0);
    assert.strictEqual(player.onGround, true);
  });

  await t.test('allows one double jump before landing', () => {
    const player = new PrincessPlayer(100, 114);
    player.onGround = true;

    player.update(
      { left: false, right: false, jump: true },
      [{ x: 0, y: 400, width: 400, height: 20 }],
      0.016,
      1000
    );
    const firstJumpVelocity = player.vy;

    player.update(
      { left: false, right: false, jump: true },
      [{ x: 0, y: 400, width: 400, height: 20 }],
      0.016,
      1000
    );
    const secondJumpVelocity = player.vy;

    player.update(
      { left: false, right: false, jump: true },
      [{ x: 0, y: 400, width: 400, height: 20 }],
      0.016,
      1000
    );

    assert.ok(firstJumpVelocity < 0);
    assert.ok(secondJumpVelocity < 0);
    assert.strictEqual(player.jumpCount, 2);
    assert.notStrictEqual(player.vy, -594);
  });

  await t.test('requires two star hits to destroy a teacup sentry', () => {
    const enemy = new TeacupSentry(
      { x: 120, patrolMin: 100, patrolMax: 180 },
      { y: 300 }
    );

    assert.strictEqual(enemy.hit(), false);
    assert.strictEqual(enemy.hp, 1);
    assert.strictEqual(enemy.destroyed, false);

    assert.strictEqual(enemy.hit(), true);
    assert.strictEqual(enemy.destroyed, true);
  });

  await t.test('keeps destroyed teacups briefly for the destroy sprite', () => {
    const enemy = new TeacupSentry(
      { x: 120, patrolMin: 100, patrolMax: 180 },
      { y: 300 }
    );

    enemy.hit();
    enemy.hit();
    assert.strictEqual(enemy.destroyed, true);
    assert.strictEqual(enemy.removeAfterDestroy, false);

    enemy.update(0.2);
    assert.strictEqual(enemy.removeAfterDestroy, false);

    enemy.update(0.25);
    assert.strictEqual(enemy.removeAfterDestroy, true);
  });

  await t.test('detects enemy touch as game over condition', () => {
    const player = new PrincessPlayer(100, 200);
    const enemy = new TeacupSentry(
      { x: 105, patrolMin: 100, patrolMax: 180 },
      { y: 292 }
    );

    assert.strictEqual(playerTouchedEnemy(player, enemy), true);
    enemy.destroyed = true;
    assert.strictEqual(playerTouchedEnemy(player, enemy), false);
  });

  await t.test('detects reaching the castle as the win condition', () => {
    const player = new PrincessPlayer(240, 220);
    const castle = { bounds: { x: 250, y: 230, width: 100, height: 120 } };
    assert.strictEqual(playerReachedCastle(player, castle), true);
  });
});

test('Princess Star Adventure runtime asset paths stay in the PrincessStarAdventure tree', () => {
  const paths = flattenAssetPaths(PRINCESS_ASSET_PATHS);

  assert.ok(paths.includes('castle/castle.png'));
  for (const assetPath of paths) {
    assert.match(assetUrl(assetPath), /assets\/images\/PrincessStarAdventure\//);
    assert.ok(
      fs.existsSync(path.join(assetRoot, assetPath)),
      `Missing Princess asset: ${assetPath}`
    );
  }
});

test('Princess Star Adventure input supports mobile controls', () => {
  const listeners = new Map();
  const target = {
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    removeEventListener(type) {
      listeners.delete(type);
    }
  };
  const input = new PrincessInput(target);

  input.setVirtualControl('left', true);
  input.queueVirtualAction('jump');
  let actions = input.snapshot();
  assert.strictEqual(actions.left, true);
  assert.strictEqual(actions.right, false);
  assert.strictEqual(actions.jump, true);
  assert.strictEqual(input.snapshot().jump, false);

  input.setVirtualControl('left', false);
  input.setVirtualControl('right', true);
  input.queueVirtualAction('shoot');
  actions = input.snapshot();
  assert.strictEqual(actions.left, false);
  assert.strictEqual(actions.right, true);
  assert.strictEqual(actions.shoot, true);
  assert.strictEqual(input.snapshot().shoot, false);

  input.destroy();
  assert.strictEqual(listeners.size, 0);
});

test('Princess Star Adventure assets wait for image decode before becoming ready', async () => {
  const originalImage = globalThis.Image;
  let decodeResolvers = [];
  let pendingDecodeCount = 0;

  globalThis.Image = class {
    constructor() {
      this.complete = false;
      this.naturalWidth = 0;
      this.naturalHeight = 0;
    }

    set src(value) {
      this._src = value;
      this.complete = true;
      this.naturalWidth = 448;
      this.naturalHeight = 256;
      setTimeout(() => this.onload?.(), 0);
    }

    get src() {
      return this._src;
    }

    decode() {
      pendingDecodeCount += 1;
      return new Promise((resolve) => {
        decodeResolvers.push(() => {
          pendingDecodeCount -= 1;
          resolve();
        });
      });
    }
  };

  try {
    let settled = false;
    const assetsPromise = loadPrincessAssets().then((assets) => {
      settled = true;
      return assets;
    });

    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.ok(decodeResolvers.length > 0);
    assert.strictEqual(settled, false);

    for (let attempts = 0; !settled && attempts < 20; attempts += 1) {
      const resolvers = decodeResolvers;
      decodeResolvers = [];
      for (const resolveDecode of resolvers) resolveDecode();
      await new Promise((resolve) => setTimeout(resolve, 0));
      await Promise.resolve();
    }

    const assets = await assetsPromise;
    assert.strictEqual(pendingDecodeCount, 0);
    assert.strictEqual(assets.princess.standing.length, 6);
  } finally {
    if (originalImage) {
      globalThis.Image = originalImage;
    } else {
      delete globalThis.Image;
    }
  }
});

test('Princess Star Adventure level has a long multi-height route', () => {
  assert.strictEqual(LEVEL.width, 27000);
  assert.ok(LEVEL.platforms.length >= 45);
  assert.ok(LEVEL.platforms.length <= 60);
  assert.ok(LEVEL.enemies.length >= 40);

  const platformHeights = new Set(LEVEL.platforms.map((platform) => platform.y));
  assert.ok(platformHeights.size >= 8);

  const sortedPlatforms = [...LEVEL.platforms].sort((a, b) => a.x - b.x);
  let normalJumpGaps = 0;
  let doubleJumpGaps = 0;
  const maxGap = sortedPlatforms.slice(1).reduce((largest, platform, index) => {
    const previous = sortedPlatforms[index];
    const gap = platform.x - (previous.x + previous.width);
    assert.ok(gap >= 0, `platforms overlap near x=${platform.x}`);
    if (gap > 0 && gap < 200) normalJumpGaps += 1;
    if (gap >= 220) doubleJumpGaps += 1;
    return Math.max(largest, gap);
  }, 0);

  assert.ok(maxGap <= 280);
  assert.ok(normalJumpGaps > doubleJumpGaps);
  assert.strictEqual(doubleJumpGaps, 12);

  const farthestPlatformEdge = Math.max(...LEVEL.platforms.map((platform) => platform.x + platform.width));
  assert.ok(farthestPlatformEdge <= LEVEL.width);

  for (let x = 0; x < LEVEL.width; x += 960) {
    const visibleCount = LEVEL.platforms.filter((platform) => (
      platform.x + platform.width >= x && platform.x <= x + 960
    )).length;
    assert.ok(visibleCount <= 3, `too many platforms near x=${x}: ${visibleCount}`);
  }
});
