import test from 'node:test';
import assert from 'node:assert';
import { checkCollision } from '../src/physics.js';

test('AABB Collisions', async (t) => {
  await t.test('detects overlapping rectangles', () => {
    const r1 = { x: 0, y: 0, width: 50, height: 50 };
    const r2 = { x: 25, y: 25, width: 50, height: 50 };
    assert.strictEqual(checkCollision(r1, r2), true);
  });

  await t.test('detects non-overlapping rectangles', () => {
    const r1 = { x: 0, y: 0, width: 10, height: 10 };
    const r2 = { x: 20, y: 20, width: 10, height: 10 };
    assert.strictEqual(checkCollision(r1, r2), false);
  });

  await t.test('handles boundary touching as no collision', () => {
    const r1 = { x: 0, y: 0, width: 10, height: 10 };
    const r2 = { x: 10, y: 0, width: 10, height: 10 };
    assert.strictEqual(checkCollision(r1, r2), false);
  });
});
