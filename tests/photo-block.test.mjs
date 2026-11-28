import assert from 'node:assert/strict';
import { test } from 'node:test';
import { publicPost } from '../src/features/cms/local-posts.mjs';
import { validateSnapshot } from '../src/features/cms/snapshot-posts.mjs';

test('a photo placed in the editor is published like an uploaded photo', () => {
    const image = { url: '/api/media/file/car.webp', alt: 'The car', width: 1600, height: 1200 };
    const post = publicPost({ id: 5, _status: 'published', title: 'Photos', publishedAt: '2026-11-28T12:00:00.000Z', content: { root: { children: [
        { type: 'block', fields: { blockType: 'photo', image, layout: 'right', caption: 'First lap', secret: 'PRIVATE' } },
        { type: 'block', fields: { blockType: 'photo', image, layout: 'sideways' } },
        { type: 'block', fields: { blockType: 'photo', image: { url: 'https://evil.example/x.webp' } } },
        { type: 'upload', relationTo: 'media', value: image, fields: { layout: 'wide', caption: 'Old style' } },
    ] } } });
    assert.deepEqual(post.nodes.map((node) => [node.type, node.layout, node.caption]), [
        ['photo', 'right', 'First lap'], ['photo', 'normal', ''], ['photo', 'wide', 'Old style'],
    ], 'unknown layouts fall back to normal, photos from elsewhere are left out, older uploads still work');
    assert.equal(JSON.stringify(post).includes('PRIVATE'), false);
    assert.equal(post.cover.alt, 'The car', 'the first photo is the cover when none is chosen');

    const file = `/cms-media/${'e'.repeat(64)}.webp`;
    const snapshot = validateSnapshot({ schema: 1, managedLegacyKeys: [], posts: [{ id: 1, title: 'T', publishedAt: '2026-11-28T12:00:00.000Z',
        nodes: [{ type: 'photo', photo: { url: file, alt: 'A' }, caption: 'C', layout: 'left' }] }] });
    assert.equal(snapshot.posts[0].nodes[0].layout, 'left');
});
