import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const page = name => readFileSync(new URL('../out/'+name+'.html',import.meta.url),'utf8');
const text = html => html.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&');
test('exported homepage contains the latest blog and all groups',()=>{
  const html=page('index');
  assert.match(html,/October 2026/);
  assert.match(html,/first concept review/);
  assert.match(html,/concept-review-2026/);
  for(const group of ['Board','Business','Marketing','Logistics','Aero & Composites','Mechanical','Electrical','Software'])assert.ok(text(html).includes(group),group);
});
test('exported team has the corrected role, current groups and Oliver',()=>{
  const html=page('team');
  for(const value of ['Business','Aero & Composites','Technical Leader','Oliver Vanem'])assert.ok(text(html).includes(value),value);
});
test('exported About records participation and recruitment offers generic memberships',()=>{
  assert.match(text(page('about')),/participated in iESC in September 2026/);
  const html=text(page('join'));
  for(const group of ['Board','Business','Marketing','Logistics','Aero & Composites','Mechanical','Electrical','Software'])assert.ok(html.includes(group+' Member'),group);
  assert.doesNotMatch(html,/Finance Member|Group Leader Chassis|Battery Electrical Engineer/);
});

test('exported blog includes concept review and both original photographs',()=>{
  const html=page('blog');
  assert.match(html,/first concept review/);
  assert.match(html,/October 2026/);
  assert.match(html,/concept-review-2026\/01-concept-review\.jpg/);
  assert.match(html,/concept-review-2026\/02-presentations\.jpg/);
});
