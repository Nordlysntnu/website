// What LinkedIn, Slack, Facebook and others show when someone shares a link to the blog.
export const SITE_URL = 'https://www.nordlysntnu.no';
export const SITE_NAME = 'Nordlys NTNU';
export const BLOG_DESCRIPTION = 'Test days, competitions, events and everyday life in Norway’s first solar racing team.';

const absolute = (path) => new URL(path, SITE_URL).href;

/** One line of plain text, cut at a word near `max` characters. */
export function shortText(value, max = 200) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (text.length <= max) return text;
    const cut = text.slice(0, max - 1);
    return cut.slice(0, Math.max(cut.lastIndexOf(' '), max * 0.6)).replace(/[\s,.;:–-]+$/, '') + '…';
}

function image(photo) {
    if (!photo?.url) return null;
    return { url: absolute(photo.url), width: photo.width || null, height: photo.height || null, alt: photo.alt || '' };
}

/** Share details for one article. The canonical address is the article's main slug. */
export function articleShare(post) {
    return {
        type: 'article',
        title: post.title,
        description: shortText(post.summary || post.excerpt),
        url: absolute('/blog/' + (post.slug || post.id)),
        image: image(post.cover),
        publishedAt: post.publishedAt || null,
    };
}

/** Share details for the blog list, with the newest story's cover. */
export function blogShare(posts) {
    return { type: 'website', title: 'Blog · ' + SITE_NAME, description: BLOG_DESCRIPTION, url: absolute('/blog'), image: image(posts?.[0]?.cover), publishedAt: null };
}

/** The meta tags as [attribute, key, content] rows, so a page can render them in <Head>. */
export function shareTags(share) {
    const rows = [
        ['name', 'description', share.description],
        ['property', 'og:site_name', SITE_NAME],
        ['property', 'og:type', share.type],
        ['property', 'og:title', share.title],
        ['property', 'og:description', share.description],
        ['property', 'og:url', share.url],
        ['name', 'twitter:card', share.image ? 'summary_large_image' : 'summary'],
        ['name', 'twitter:title', share.title],
        ['name', 'twitter:description', share.description],
    ];
    if (share.image) {
        rows.push(['property', 'og:image', share.image.url], ['name', 'twitter:image', share.image.url]);
        if (share.image.width && share.image.height) rows.push(['property', 'og:image:width', String(share.image.width)], ['property', 'og:image:height', String(share.image.height)]);
        if (share.image.alt) rows.push(['property', 'og:image:alt', share.image.alt]);
    }
    if (share.publishedAt) rows.push(['property', 'article:published_time', new Date(share.publishedAt).toISOString()]);
    return rows.filter(([, , content]) => content);
}
