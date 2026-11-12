import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const navBar = readFileSync(new URL('../src/features/ui/NavBar.js', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../src/features/ui/Footer.js', import.meta.url), 'utf8');

// The wiki is for members only, so it belongs in the footer, not the top menu (#106, #133).
test('the member wiki is linked from the footer, not the top menu', () => {
  assert.doesNotMatch(navBar, /wiki/i);
  assert.match(footer, /href="https:\/\/wiki\.nordlysntnu\.no"[^>]*>Member wiki/);
});
