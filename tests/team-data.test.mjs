import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  ALL_MEMBERS,
  buildProjects,
  getGroupMembers,
  getProjectGroups,
  selectGroup,
  selectProject,
} from '../src/features/team/teamData.mjs';

const profiles = [
  { id: 1, name: 'Returning member', image: '/members/example.webp', email: 'member@example.com' },
  { id: 2, name: 'Former member', image: '/members/former.webp' },
];
const definitions = [
  {
    year: 2025,
    name: 'Project 2025',
    groups: ['Mechanical', 'Technical advisor', 'Alumni'],
    members: [
      { id: 1, title: 'Mechanical Engineer', group: ['Mechanical'] },
      { id: 2, title: 'Former member', group: ['Alumni'] },
    ],
  },
  {
    year: 2026,
    name: 'Project 2026',
    groups: ['Chassis'],
    members: [{ id: 1, title: 'Group Leader Chassis', group: ['Chassis', 'All active members'] }],
  },
];

test('all configured profiles are represented by valid project memberships', () => {
  const dataDirectory = new URL('../src/features/team/data/', import.meta.url);
  const readJson = name => JSON.parse(readFileSync(new URL(name, dataDirectory), 'utf8'));
  const actualProfiles = readJson('members.json');
  const actualDefinitions = readdirSync(new URL('projects/', dataDirectory))
    .filter(name => name.endsWith('.json'))
    .map(name => readJson(`projects/${name}`));
  const projects = buildProjects(actualProfiles, actualDefinitions);
  const referencedIds = new Set(projects.flatMap(project => project.members.map(member => member.id)));
  assert.equal(referencedIds.size, actualProfiles.length);
  assert.ok(actualProfiles.every(profile => referencedIds.has(profile.id)));
});

test('returning members keep their profile and the correct role for each year', () => {
  const projects = buildProjects(profiles, definitions);
  const olderMember = getGroupMembers(selectProject(projects, '2025'), 'Mechanical')[0];
  const newerMember = getGroupMembers(selectProject(projects, '2026'), 'Chassis')[0];
  assert.equal(olderMember.title, 'Mechanical Engineer');
  assert.equal(newerMember.title, 'Group Leader Chassis');
  for (const [field, value] of Object.entries(profiles[0])) {
    assert.deepEqual(olderMember[field], value);
    assert.deepEqual(newerMember[field], value);
  }
  assert.equal(getGroupMembers(selectProject(projects, '2026'), 'Alumni').length, 0);
  assert.equal(getGroupMembers(selectProject(projects, '2025'), 'Alumni').length, 1);
});

test('groups and the newest year come from project data, including new project years', () => {
  const projects = buildProjects(profiles, [...definitions, {
    year: 2027,
    name: 'Project 2027',
    groups: ['Battery'],
    members: [{ id: 1, title: 'Battery Engineer', group: ['Battery'] }],
  }]);
  assert.deepEqual(projects.map(project => project.year), [2027, 2026, 2025]);
  assert.equal(selectProject(projects).year, 2027);
  assert.deepEqual(getProjectGroups(selectProject(projects, '2027')), [ALL_MEMBERS, 'Battery']);
  assert.equal(getProjectGroups(selectProject(projects, '2025')).includes('Chassis'), false);
  assert.equal(getProjectGroups(selectProject(projects, '2026')).includes('Chassis'), true);
  assert.equal(getProjectGroups(selectProject(projects, '2026')).includes('All active members'), false);
});

test('switching to a year without the selected group falls back to All members', () => {
  const projects = buildProjects(profiles, definitions);
  assert.equal(selectGroup(selectProject(projects, '2025'), 'Chassis'), ALL_MEMBERS);
  assert.equal(selectGroup(selectProject(projects, '2026'), 'Mechanical'), ALL_MEMBERS);
});

test('links with a year use that year and match group names without case sensitivity', () => {
  const projects = buildProjects(profiles, definitions);
  const project = selectProject(projects, '2025', ' mechanical ');
  assert.equal(project.year, 2025);
  assert.equal(selectGroup(project, ' mechanical '), 'Mechanical');
});

test('existing group links without a year can open an older project', () => {
  const projects = buildProjects(profiles, definitions);
  assert.equal(selectProject(projects, undefined, 'technical advisor').year, 2025);
  assert.equal(selectProject(projects, undefined, 'chassis').year, 2026);
});

test('old Aero group links still select the renamed group and its members', () => {
  const projects = buildProjects(profiles, [...definitions, {
    year: 2027,
    name: 'Project 2027',
    groups: ['Aero & Composites'],
    members: [{ id: 1, title: 'Aero & Composites Member', group: ['Aero & Composites'] }],
  }]);

  for (const query of ['aero- and composites', 'aero & composites']) {
    const project = selectProject(projects, undefined, query);
    const group = selectGroup(project, query);
    assert.equal(project.year, 2027);
    assert.equal(group, 'Aero & Composites');
    assert.deepEqual(getGroupMembers(project, group).map(member => member.id), [1]);
    assert.equal(selectGroup(selectProject(projects, '2027'), query), group);
  }
});

test('invalid URL parameters select a valid project and group', () => {
  const projects = buildProjects(profiles, definitions);
  for (const year of ['not-a-year', '1900', ['2025', '2026']]) {
    assert.equal(selectProject(projects, year).year, 2026);
  }
  for (const group of ['unknown', ['Chassis', 'Alumni'], undefined]) {
    assert.equal(selectGroup(projects[0], group), ALL_MEMBERS);
  }
});

test('duplicate profile IDs are rejected before they can become duplicate React keys', () => {
  assert.throws(() => buildProjects([...profiles, { id: 1, name: 'Another person' }], definitions), /unique positive integers/);
});

test('unknown profiles and repeated members in a project are rejected', () => {
  const unknownProfile = structuredClone(definitions);
  unknownProfile[0].members[0].id = 999;
  assert.throws(() => buildProjects(profiles, unknownProfile), /Unknown member 999/);

  const repeatedMember = structuredClone(definitions);
  repeatedMember[0].members.push(repeatedMember[0].members[0]);
  assert.throws(() => buildProjects(profiles, repeatedMember), /Duplicate member 1/);
});

test('undeclared groups are rejected instead of silently hiding members', () => {
  const changed = structuredClone(definitions);
  changed[0].members[0].group = ['Misspelled group'];
  assert.throws(() => buildProjects(profiles, changed), /Unknown group/);
});

test('duplicate years and invalid group navigation entries are rejected', () => {
  assert.throws(() => buildProjects(profiles, [definitions[0], definitions[0]]), /Project years must be unique/);
  for (const groups of [['Mechanical', 'Mechanical'], [ALL_MEMBERS], ['All active members']]) {
    const changed = structuredClone(definitions);
    changed[0].groups = groups;
    assert.throws(() => buildProjects(profiles, changed), /Invalid group list/);
  }
});

test('a team must contain at least one project', () => {
  assert.throws(() => buildProjects(profiles, []), /At least one team project/);
});
