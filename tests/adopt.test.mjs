import test from 'node:test';
import assert from 'node:assert/strict';
import { BODY_POINTS, BUNDLES, CANOPY, MAX_PANELS_PER_ORDER, MODULE_FRAMES, PANELS, cleanName, priceFor, validPanelSelection } from '../src/features/adopt/adopt.mjs';
import { DIRECTIONS, neighbour } from '../src/features/adopt/keyboard.mjs';

test('one panel costs 100 kr and bundles give the cheapest combination', () => {
  assert.deepEqual(BUNDLES.map(bundle => [bundle.panels, bundle.price]), [[1, 100], [5, 399], [10, 699]]);
  const expected = { 1: 100, 4: 400, 5: 399, 6: 499, 10: 699, 12: 899, 15: 1098, 20: 1398, 50: 3495 };
  for (const [count, total] of Object.entries(expected)) assert.equal(priceFor(Number(count)).total, total, count);
  assert.deepEqual(priceFor(12).parts.map(part => [part.panels, part.times]), [[10, 1], [1, 2]]);
  assert.equal(priceFor(10).saved, 301);
  assert.equal(priceFor(0).total, 0);
  for (let count = 1; count <= MAX_PANELS_PER_ORDER; count++) {
    assert.ok(priceFor(count).total <= count * 100, 'never more than single panels');
  }
  assert.throws(() => priceFor(MAX_PANELS_PER_ORDER + 1), RangeError);
  assert.throws(() => priceFor(1.5), RangeError);
});

// Ray casting: is the point inside the outline of the car body?
function insideBody([x, y]) {
  let inside = false;
  for (let i = 0, j = BODY_POINTS.length - 1; i < BODY_POINTS.length; j = i++) {
    const [xi, yi] = BODY_POINTS[i];
    const [xj, yj] = BODY_POINTS[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const corners = panel => [[panel.x, panel.y], [panel.x + panel.w, panel.y], [panel.x, panel.y + panel.h], [panel.x + panel.w, panel.y + panel.h]];

test('the car has the 350 cells of the solar array drawing, in 18 modules', () => {
  const cells = Object.fromEntries(MODULE_FRAMES.map(module => [module.id, PANELS.filter(panel => panel.module === module.id).length]));
  assert.deepEqual(cells, {
    A: 48, B: 48, C: 48, D: 48, E: 36, F: 36, G: 5, H: 5, J: 24, K: 10, L: 12, M: 6, N: 6, P: 1, Q: 1, R: 3, S: 10, T: 3,
  });
  assert.equal(PANELS.length, 350);
  assert.equal(new Set(PANELS.map(panel => panel.id)).size, PANELS.length);
  for (const panel of PANELS) assert.match(panel.id, /^[A-HJ-NP-T]\d{1,2}$/);
});

test('every panel sits on the body, off the canopy and apart from the others', () => {
  for (const panel of PANELS) {
    assert.ok(corners(panel).every(insideBody), `${panel.id} is outside the body`);
    const nearest = [Math.max(panel.x, Math.min(CANOPY.cx, panel.x + panel.w)), Math.max(panel.y, Math.min(CANOPY.cy, panel.y + panel.h))];
    assert.ok(((nearest[0] - CANOPY.cx) / CANOPY.rx) ** 2 + ((nearest[1] - CANOPY.cy) / CANOPY.ry) ** 2 >= 1, `${panel.id} covers the canopy`);
  }
  for (const [i, a] of PANELS.entries()) {
    for (const b of PANELS.slice(i + 1)) {
      const apart = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
      assert.ok(apart, `${a.id} overlaps ${b.id}`);
    }
  }
});

test('the arrow keys reach every panel, with the car upright and on its side', () => {
  for (const upright of [true, false]) {
    const seen = new Set([PANELS[0].id]);
    const queue = [PANELS[0]];
    while (queue.length) {
      const panel = queue.shift();
      for (const key of Object.keys(DIRECTIONS)) {
        const next = neighbour(panel, key, upright);
        if (!seen.has(next.id)) { seen.add(next.id); queue.push(next); }
      }
    }
    assert.equal(seen.size, PANELS.length, upright ? 'upright' : 'on its side');
  }
  const a1 = PANELS.find(panel => panel.id === 'A1');
  assert.equal(neighbour(a1, 'ArrowRight', true).id, 'A2');
  assert.equal(neighbour(a1, 'ArrowDown', true).id, 'A5');
  assert.equal(neighbour(a1, 'ArrowRight', false).id, 'A5', 'on its side the rows run left to right');
});

test('panel choices and names from buyers are checked', () => {
  const [a, b] = PANELS.map(panel => panel.id);
  assert.equal(validPanelSelection([a, b]), null);
  assert.ok(validPanelSelection([]));
  assert.ok(validPanelSelection([a, a]));
  assert.ok(validPanelSelection(['Z99']));
  assert.ok(validPanelSelection('A1'));
  assert.equal(cleanName('  Kari ‮ Nordmann\u0007 '), 'Kari Nordmann');
  assert.equal(cleanName('x'.repeat(80)).length, 40);
  assert.equal(cleanName(undefined), '');
});
