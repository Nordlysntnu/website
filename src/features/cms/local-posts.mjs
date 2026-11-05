// Server-side reader for the explicit laptop preview. Never receives login cookies.
export const localCMSOrigin = 'http://127.0.0.1:3010';
export function localPreviewEnabled(env = process.env) {
    return env.NODE_ENV === 'development' && env.NEXT_PUBLIC_LOCAL_PREVIEW === 'true';
}
export function safeLink(value) {
    if (typeof value !== 'string') return null;
    if (/^\/(?!\/)/.test(value) && !value.includes('\\') && !/[\u0000-\u0020]/.test(value)) return value;
    if (/^#[\w-]+$/.test(value)) return value;
    try { const url = new URL(value); return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.href : null; }
    catch { return null; }
}
export function publicPhoto(value) {
    if (!value || typeof value !== 'object' || typeof value.url !== 'string') return null;
    try {
        const url = new URL(value.url, localCMSOrigin);
        if (url.origin !== localCMSOrigin || url.username || url.password || !url.pathname.startsWith('/api/media/file/')) return null;
        return { url: url.href, alt: String(value.alt || ''), width: value.width || null, height: value.height || null };
    } catch { return null; }
}
export function publicNodes(value, depth = 0) {
    if (!Array.isArray(value) || depth > 30) return [];
    return value.flatMap((node) => {
        if (!node || typeof node !== 'object') return [];
        if (node.type === 'text') return [{ type: 'text', text: String(node.text || ''), format: Number(node.format) || 0 }];
        if (node.type === 'linebreak') return [{ type: 'linebreak' }];
        if (node.type === 'upload' && node.relationTo === 'media') {
            const photo = publicPhoto(node.value);
            return photo ? [{ type: 'photo', photo, caption: String(node.fields?.caption || '') }] : [];
        }
        const children = publicNodes(node.children, depth + 1);
        if (node.type === 'link' || node.type === 'autolink') {
            const doc = node.fields?.doc;
            const id = typeof doc?.value === 'object' ? doc.value?.id : doc?.value;
            const url = doc?.relationTo === 'posts' && /^\d+$/.test(String(id)) ? '/blog/' + id : safeLink(node.fields?.url);
            return [{ type: 'link', url, children }];
        }
        if (['paragraph', 'heading', 'quote', 'list', 'listitem'].includes(node.type)) {
            return [{ type: node.type, tag: node.type === 'heading' && node.tag === 'h3' ? 'h3' : node.type === 'list' && node.tag === 'ol' ? 'ol' : null, children }];
        }
        return children;
    });
}
export function nodeText(nodes) {
    return nodes.map((node) => node.type === 'text' ? node.text : nodeText(node.children || [])).join(' ').replace(/\s+/g, ' ').trim();
}
export function publicPost(doc) {
    if (doc?._status !== 'published' || !Number.isSafeInteger(doc.id) || doc.id <= 0) throw new Error('Expected a published article.');
    const nodes = publicNodes(doc.content?.root?.children);
    const gallery = (Array.isArray(doc.gallery) ? doc.gallery : []).map((row) => publicPhoto(row.image)).filter(Boolean);
    const inlinePhoto = (items) => items.reduce((found, item) => found || item.photo || inlinePhoto(item.children || []), null);
    return { id: doc.id, title: String(doc.title || ''), summary: String(doc.summary || ''), author: String(doc.authorName || ''),
        department: String(doc.department || 'Team'), publishedAt: String(doc.publishedAt || ''), nodes,
        cover: publicPhoto(doc.coverImage) || gallery[0] || inlinePhoto(nodes), gallery,
        excerpt: String(doc.summary || nodeText(nodes)).slice(0, 320) };
}
export async function readLocalPosts({ env = process.env, fetcher = fetch } = {}) {
    if (!localPreviewEnabled(env)) return null;
    const posts = [];
    for (let page = 1; page <= 100; page++) {
        const url = new URL('/api/posts', localCMSOrigin);
        url.search = new URLSearchParams({ 'where[_status][equals]': 'published', draft: 'false', depth: '2', limit: '100', page: String(page), sort: '-publishedAt' });
        const response = await fetcher(url, { headers: { Accept: 'application/json' }, credentials: 'omit', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error('Local CMS did not respond successfully.');
        const result = await response.json();
        if (!Array.isArray(result.docs)) throw new Error('Invalid local CMS response.');
        posts.push(...result.docs.map(publicPost));
        if (!result.hasNextPage) return posts;
    }
    throw new Error('Too many local CMS pages.');
}
export async function localBlogProps() {
    try { return { cmsPosts: await readLocalPosts(), cmsError: null }; }
    catch { return { cmsPosts: [], cmsError: 'The local CMS is unavailable. Keep both terminals running, then refresh this page.' }; }
}
