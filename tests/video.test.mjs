import assert from 'node:assert/strict';
import { test } from 'node:test';
import { youtubeEmbedURL, youtubeId } from '../src/features/cms/video.mjs';
import { publicPost } from '../src/features/cms/local-posts.mjs';
import { validateSnapshot } from '../src/features/cms/snapshot-posts.mjs';

const id = 'R_lVdrHnbYo';

test('YouTube links of every common shape give the video id', () => {
    for (const link of [id, `https://youtu.be/${id}?si=abc`, `https://www.youtube.com/watch?v=${id}&t=42s`, `https://m.youtube.com/watch?v=${id}`,
        `https://youtube.com/shorts/${id}`, `https://www.youtube.com/live/${id}`, `https://www.youtube-nocookie.com/embed/${id}`, ` https://youtu.be/${id} `]) {
        assert.equal(youtubeId(link), id, link);
    }
    for (const link of ['', null, 'https://vimeo.com/123', `https://evil.example/watch?v=${id}`, `javascript:alert('${id}')`, 'https://youtu.be/short', `ftp://youtu.be/${id}`]) {
        assert.equal(youtubeId(link), null, String(link));
    }
    assert.equal(youtubeEmbedURL(id), `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`);
});

test('a video block reaches the website as its id and caption only', () => {
    const post = publicPost({ id: 3, _status: 'published', title: 'Video', publishedAt: '2026-11-02T12:00:00.000Z', content: { root: { children: [
        { type: 'block', fields: { blockType: 'video', url: `https://youtu.be/${id}?si=tracking`, caption: 'The first drive', secret: 'PRIVATE' } },
        { type: 'block', fields: { blockType: 'video', url: 'https://vimeo.com/123' } },
    ] } } });
    assert.deepEqual(post.nodes, [{ type: 'video', youtubeId: id, caption: 'The first drive' }], 'a link YouTube cannot play is left out');

    const snapshot = (nodes) => validateSnapshot({ schema: 1, managedLegacyKeys: [], posts: [{ id: 1, title: 'T', publishedAt: '2026-11-02T12:00:00.000Z', nodes }] });
    assert.deepEqual(snapshot([{ type: 'video', youtubeId: id, caption: 'Drive', extra: 'PRIVATE' }]).posts[0].nodes, [{ type: 'video', youtubeId: id, caption: 'Drive' }]);
    assert.throws(() => snapshot([{ type: 'video', youtubeId: '"><script>' }]), /video/);
});
