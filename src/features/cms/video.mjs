// YouTube links that writers paste into an article. Only the 11-character video id is kept and published.
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = ['youtube.com', 'youtube-nocookie.com', 'music.youtube.com'];

export const isYoutubeId = (value) => typeof value === 'string' && VIDEO_ID.test(value);

/** The video id from a youtu.be, watch, shorts, live or embed link, or null. */
export function youtubeId(value) {
    const text = String(value ?? '').trim();
    if (VIDEO_ID.test(text)) return text;
    let url;
    try { url = new URL(text); } catch { return null; }
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^(www\.|m\.)/, '');
    let id = null;
    if (host === 'youtu.be') id = url.pathname.split('/')[1] || null;
    else if (HOSTS.includes(host)) {
        id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/]+)/)?.[1] ?? null;
    }
    return isYoutubeId(id) ? id : null;
}

// The privacy-enhanced player. It is only loaded after the reader presses play.
export const youtubeEmbedURL = (id, autoplay = true) => `https://www.youtube-nocookie.com/embed/${id}?rel=0${autoplay ? '&autoplay=1' : ''}`;
