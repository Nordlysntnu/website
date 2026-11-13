import test from 'node:test';
import assert from 'node:assert/strict';
import { BUNDLES, CAR, MAX_PANELS_PER_ORDER, PANELS, cleanName, priceFor, validPanelSelection } from '../src/features/adopt/adopt.mjs';

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

test('the placeholder car has unique panels that fit inside the drawing', () => {
  assert.ok(PANELS.length >= 100, 'enough panels to adopt');
  assert.equal(new Set(PANELS.map(panel => panel.id)).size, PANELS.length);
  for (const panel of PANELS) {
    assert.match(panel.id, /^[A-H]\d{1,2}$/);
    assert.ok(panel.x >= 0 && panel.y >= 0 && panel.x + panel.size <= CAR.width && panel.y + panel.size <= CAR.height, panel.id);
  }
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
