import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const markdown = readFileSync(new URL('../src/markdown/join.md', import.meta.url), 'utf8');
const joinPage = readFileSync(new URL('../src/pages/join.js', import.meta.url), 'utf8');
const groupIconsSource = readFileSync(new URL('../src/features/ui/groupIcons.js', import.meta.url), 'utf8');
const project = JSON.parse(readFileSync(new URL('../src/features/team/data/projects/2027.json', import.meta.url), 'utf8'));
const expectedGroups = ['Board', 'Business', 'Marketing', 'Logistics', 'Aero & Composites', 'Mechanical', 'Electrical', 'Software'];
const sections = markdown.split(/^# /m).filter(Boolean).map(section => ({
  name: section.split(/\r?\n/)[0].trim(),
  roles: [...section.matchAll(/^## (.+)$/gm)].map(match => match[1].trim()),
}));

test('membership applications cover every current team group in the requested order', () => {
  assert.deepEqual(sections.map(section => section.name), expectedGroups);
  assert.deepEqual(new Set(sections.map(section => section.name)), new Set(project.groups.filter(group => group !== 'Technical advisors')));
});

test('each group offers one general Member choice rather than specialist vacancies', () => {
  for (const section of sections) {
    assert.deepEqual(section.roles, [section.name + ' Member'], section.name);
  }
  assert.doesNotMatch(markdown, /Chassis|Finance Member|Group Leader|Battery Electrical Engineer|Embedded Engineer|Structural and Safety|Body Mechanisms|Software Developer|Web Developer|Key Account Manager|Content Creator|Event Manager/i);
});

test('all recruitment groups have a light and a dark icon in the shared icon map', () => {
  assert.match(joinPage, /MarkdownGroupParser\("src\/markdown\/join\.md", groupIcons\)/, 'join page must pass the shared icon map to the parser');
  const block = groupIconsSource.match(/export const groupIcons = \{([\s\S]*?)\r?\n\};/);
  assert.ok(block, 'groupIcons.js must export the icon map');
  const mappings = [...block[1].matchAll(/^\s*(?:'([^']+)'|([a-z]+)):\s*icon\(([A-Za-z]+), ([A-Za-z]+)\),?$/gm)];
  const actualKeys = mappings.map(match => match[1] || match[2]);
  const expectedKeys = expectedGroups.map(name => name.toLowerCase().replace(/\s+/g, '-'));
  assert.deepEqual(actualKeys, expectedKeys);
  for (const match of mappings) {
    for (const binding of [match[3], match[4]]) {
      const imported = groupIconsSource.match(new RegExp('import ' + binding + " from '@assets/(.+?)';"));
      assert.ok(imported, 'missing imported icon ' + binding);
      assert.ok(existsSync(new URL('../src/assets/' + imported[1], import.meta.url)), 'missing icon file ' + imported[1]);
    }
    assert.equal(match[4], match[3] + 'Dark', 'dark icon must be the generated version of ' + match[3]);
  }
});

test('the actual recruitment parser returns usable member choices and images for every group', async () => {
  const source = readFileSync(new URL('../src/features/join/MarkdownGroupParser.js', import.meta.url), 'utf8');
  const parserModule = source.replace(
    'import { MarkdownToHtml } from "@shared/utils/MarkdownToHtml";',
    'const MarkdownToHtml = async text => text;',
  );
  assert.notEqual(parserModule, source, 'the Markdown renderer is isolated from this structural parser test');
  const { MarkdownGroupParser } = await import('data:text/javascript;base64,' + Buffer.from(parserModule).toString('base64'));
  const keys = expectedGroups.map(name => name.toLowerCase().replace(/\s+/g, '-'));
  const imageMap = Object.fromEntries(keys.map(key => [key, '/images/' + key + '.png']));
  const groups = await MarkdownGroupParser('src/markdown/join.md', imageMap);
  assert.deepEqual(Object.keys(groups), keys);
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    const group = groups[key];
    const roles = Object.keys(group).filter(field => !['name', 'image', 'description'].includes(field));
    assert.equal(group.name, expectedGroups[index]);
    assert.equal(group.image, imageMap[key]);
    assert.ok(group.description.trim());
    assert.deepEqual(roles, [key + '-member']);
    assert.ok(group[roles[0]].text.trim());
  }
});
