import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { readLocalPosts, publicPost, safeLink, publicPhoto } from '../src/features/cms/local-posts.mjs';
const env = { NODE_ENV: 'development', NEXT_PUBLIC_LOCAL_PREVIEW: 'true' };
const fixture = { id: 1, _status: 'published', title: 'Workshop update', summary: 'Test complete.', department: 'Software',
    publishedAt: '2026-11-02T12:00:00.000Z', reviewNote: 'PRIVATE', ownerId: 20, content: { root: { children: [
        { type: 'paragraph', children: [{ type: 'text', text: '<script>ordinary escaped text</script>', format: 1 }] },
        { type: 'link', fields: { url: 'javascript:alert(1)' }, children: [{ type: 'text', text: 'Unsafe link' }] },
        { type: 'upload', relationTo: 'media', value: { url: '/api/media/file/photo.webp', alt: 'Workshop' }, fields: { caption: 'On the test bench.' } },
    ] } } };

test('normal development and all production builds never query a CMS', async () => {
    for (const values of [{ NODE_ENV: 'production', NEXT_PUBLIC_LOCAL_PREVIEW: 'true' }, { NODE_ENV: 'development' }]) {
        let calls = 0;
        assert.equal(await readLocalPosts({ env: values, fetcher: () => { calls++; throw new Error('Unexpected request'); } }), null);
        assert.equal(calls, 0);
    }
});
test('local reader uses anonymous loopback requests and follows published pagination', async () => {
    const pages = [];
    const posts = await readLocalPosts({ env, fetcher: async (url, options) => {
        assert.equal(url.origin, 'http://127.0.0.1:3010');
        assert.equal(url.searchParams.get('draft'), 'false');
        assert.equal(url.searchParams.get('where[_status][equals]'), 'published');
        assert.equal(options.credentials, 'omit');
        assert.equal(options.redirect, 'error');
        assert.deepEqual(Object.keys(options.headers), ['Accept']);
        const page = Number(url.searchParams.get('page')); pages.push(page);
        return Response.json({ docs: [{ ...fixture, id: page }], hasNextPage: page === 1 });
    } });
    assert.deepEqual(pages, [1, 2]); assert.deepEqual(posts.map(({ id }) => id), [1, 2]);
    assert.equal(JSON.stringify(posts).includes('PRIVATE'), false);
});
test('unexpected drafts and broken CMS responses fail instead of exposing a draft or switching to production', async () => {
    await assert.rejects(readLocalPosts({ env, fetcher: async () => Response.json({ docs: [{ ...fixture, _status: 'draft' }] }) }), /published/);
    await assert.rejects(readLocalPosts({ env, fetcher: async () => new Response('', { status: 503 }) }), /Local CMS/);
});
test('public projection preserves text/photos/captions and drops private fields and unsafe URLs', () => {
    const post = publicPost(fixture);
    assert.equal(post.reviewNote, undefined); assert.equal(post.ownerId, undefined);
    assert.equal(post.nodes[0].children[0].text, '<script>ordinary escaped text</script>');
    assert.equal(post.nodes[1].url, null);
    assert.equal(post.cover.url, 'http://127.0.0.1:3010/api/media/file/photo.webp');
    assert.equal(post.nodes[2].caption, 'On the test bench.');
    for (const bad of ['javascript:alert(1)', 'data:text/html,x', '//outside.test', '/\\outside.test', '/\nunsafe']) assert.equal(safeLink(bad), null);
    assert.equal(safeLink('/blog/4'), '/blog/4');
    assert.equal(publicPhoto({ url: 'https://nordlysntnu.no/api/media/file/photo.webp' }), null);
});
test('production config cannot enable the laptop preview and local build artifacts are separate', () => {
    const require = createRequire(import.meta.url);
    const configure = require('../next.config.js');
    const previous = process.env.NEXT_PUBLIC_LOCAL_PREVIEW;
    try {
        process.env.NEXT_PUBLIC_LOCAL_PREVIEW = 'true';
        const production = configure('phase-production-build');
        assert.equal(production.env.NEXT_PUBLIC_LOCAL_PREVIEW, 'false');
        assert.equal(production.output, 'export'); assert.equal(production.distDir, '.next');
        const local = configure('phase-development-server');
        assert.equal(local.env.NEXT_PUBLIC_LOCAL_PREVIEW, 'true'); assert.equal(local.distDir, '.next-local');
    } finally {
        if (previous === undefined) delete process.env.NEXT_PUBLIC_LOCAL_PREVIEW;
        else process.env.NEXT_PUBLIC_LOCAL_PREVIEW = previous;
    }
});
