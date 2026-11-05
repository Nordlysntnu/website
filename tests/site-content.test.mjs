import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { buildProjects, selectProject, selectGroup, getGroupMembers } from '../src/features/team/teamData.mjs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const profiles = JSON.parse(read('src/features/team/data/members.json'));
const definitions = ['2025','2026','2027'].map(year => JSON.parse(read('src/features/team/data/projects/' + year + '.json')));
const projects = buildProjects(profiles, definitions);
const current = selectProject(projects);
const order = ['Board','Business','Marketing','Logistics','Aero & Composites','Mechanical','Electrical','Software'];

test('current team groups and homepage follow the requested order including Business', () => {
  assert.deepEqual(current.groups, [...order, 'Technical advisor']);
  const cards = [...read('src/features/home/Disciplines.js').matchAll(/<Discipline[^>]*title="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(cards, order);
  const intro = read('src/pages/team.js');
  assert.match(intro, /projects\[0\]\.groups/);
  assert.match(intro, /\{groupList\}/);
});

test('Sander is Technical Leader and Oliver Vanem remains an Aero & Composites member', () => {
  assert.equal(current.members.find(member => member.name === 'Sander Ranbø').title, 'Technical Leader');
  const aero = getGroupMembers(current, selectGroup(current,'Aero & Composites'));
  assert.equal(aero.filter(member => member.name === 'Oliver Vanem').length, 1);
  assert.equal(selectGroup(current,'Chassis'),'Aero & Composites');
});

test('all three technical advisors have local portrait files and no published phone numbers', () => {
  const advisors = getGroupMembers(current,'Technical advisor');
  assert.deepEqual(new Set(advisors.map(member=>member.name)), new Set(['Steve Völler','Shivaraj Chandrakant Patil','Rafael Bölsterli']));
  for (const advisor of advisors) {
    assert.ok(advisor.image && !advisor.image.includes('photo-coming-soon'), advisor.name);
    assert.ok(existsSync(new URL('../public'+advisor.image,import.meta.url)), advisor.image);
    assert.ok(existsSync(new URL('../public'+(advisor.fullImage||advisor.image),import.meta.url)));
    assert.equal(advisor.phone,null);
  }
});

test('concept review is the latest October 2026 update with both Obsidian photos', async () => {
  const {blogs} = await import('data:text/javascript;base64,'+Buffer.from(read('src/shared/data/blog.tsx')).toString('base64'));
  assert.equal(blogs[0].date,'October 2026');
  assert.match(blogs[0].text,/first concept review/);
  assert.match(blogs[0].text,/Rafael, Shivaraj and Steve/);
  assert.equal(blogs[0].images.length,2);
  assert.equal(blogs[0].imageAlts.length,2);
  for(const image of blogs[0].images)assert.ok(existsSync(new URL('../public'+image,import.meta.url)),image);
  assert.equal(blogs[1].date,'September 2026');
});

test('competition history records the completed iESC debut', () => {
  const history = read('src/markdown/competitions.md');
  assert.match(history,/participated in iESC in September 2026/);
  assert.match(history,/120 laps and 480 km/);
  assert.doesNotMatch(history,/Next competition: 19 & 20 September 2026|two competitions we are aiming to compete in/);
});
