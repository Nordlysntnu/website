import assert from 'node:assert/strict';
import { test } from 'node:test';
import { articleShare, blogShare, shareTags, shortText } from '../src/features/cms/share.mjs';

const cover = { url: `/cms-media/${'c'.repeat(64)}.jpg`, alt: 'The car at Dragvoll', width: 2000, height: 1500 };
const post = { id: 7, slug: 'legacy-0123456789abcdef0123', title: 'First test drive', summary: '  We drove   the car\nfor the first time. ', excerpt: 'Ignored', publishedAt: '2026-10-20T10:00:00.000Z', cover };

test('an article shares its title, introduction, cover and canonical address', () => {
    const share = articleShare(post);
    assert.equal(share.url, 'https://www.nordlysntnu.no/blog/legacy-0123456789abcdef0123', 'the main slug, not the number');
    assert.equal(share.description, 'We drove the car for the first time.');
    assert.equal(share.image.url, `https://www.nordlysntnu.no/cms-media/${'c'.repeat(64)}.jpg`);
    const tags = Object.fromEntries(shareTags(share).map(([, key, content]) => [key, content]));
    assert.equal(tags['og:type'], 'article');
    assert.equal(tags['og:title'], 'First test drive');
    assert.equal(tags['og:image:width'], '2000');
    assert.equal(tags['og:image:alt'], 'The car at Dragvoll');
    assert.equal(tags['twitter:card'], 'summary_large_image');
    assert.equal(tags['article:published_time'], '2026-10-20T10:00:00.000Z');
    assert.equal(tags.description, tags['og:description']);
});

test('without an introduction or cover the card still works', () => {
    const share = articleShare({ id: 12, title: 'No photo', summary: '', excerpt: 'From the body text.', publishedAt: null, cover: null });
    assert.equal(share.url, 'https://www.nordlysntnu.no/blog/12');
    assert.equal(share.description, 'From the body text.');
    const rows = shareTags(share);
    assert.ok(rows.every(([, , content]) => content), 'no empty tags');
    assert.equal(Object.fromEntries(rows.map(([, key, content]) => [key, content]))['twitter:card'], 'summary');
    assert.ok(!rows.some(([, key]) => key.startsWith('og:image')));
});

test('the blog list shares the newest cover', () => {
    const share = blogShare([post, { ...post, cover: null }]);
    assert.equal(share.url, 'https://www.nordlysntnu.no/blog');
    assert.equal(share.image.url, articleShare(post).image.url);
    assert.equal(blogShare([]).image, null);
});

test('long text is cut at a word with an ellipsis', () => {
    const long = 'Solar racing '.repeat(40);
    const text = shortText(long, 200);
    assert.ok(text.length <= 200);
    assert.ok(text.endsWith('…'));
    assert.ok(!/\s…$/.test(text));
    assert.equal(shortText('Short.'), 'Short.');
});
