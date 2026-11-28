import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './CmsBlog.module.css';
import { youtubeEmbedURL } from './video.mjs';

// The YouTube player is only loaded after the reader presses play, so nothing is sent to YouTube
// just by opening the article (as on the About page).
function Video({ node }) {
    const [playing, setPlaying] = useState(false);
    const frame = useRef(null);
    useEffect(() => { if (playing) frame.current?.focus(); }, [playing]);
    const title = node.caption || 'Video';
    return <figure className={styles.video}>
        <div className={styles.videoFrame}>
            {playing
                ? <iframe ref={frame} src={youtubeEmbedURL(node.youtubeId)} title={title}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" />
                : <button type="button" className={styles.videoStart} onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
                    <span className={styles.videoPlay} aria-hidden="true" />
                    <span className={styles.videoText}>Play video<small>From YouTube</small></span>
                </button>}
        </div>
        {node.caption && <figcaption>{node.caption}</figcaption>}
    </figure>;
}

const href = (post) => '/blog/' + (post.slug || post.id);

function date(value) {
    return Number.isNaN(Date.parse(value)) ? '' : new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'Europe/Oslo' }).format(new Date(value));
}

function Meta({ post }) {
    return <p className={styles.meta}><span className={styles.tag}>{post.department}</span><time dateTime={post.publishedAt}>{date(post.publishedAt)}</time></p>;
}

export function CmsPostList({ posts, error }) {
    const groups = useMemo(() => ['All', ...new Set(posts.map((post) => post.department).filter(Boolean))], [posts]);
    const [group, setGroup] = useState('All');
    const shown = group === 'All' ? posts : posts.filter((post) => post.department === group);
    const [featured, ...rest] = shown;

    return <div className={styles.page}>
        <section className={styles.list}>
            <header className={styles.listHeader}>
                <p className={styles.eyebrow}>The Nordlys blog</p>
                <h1>Stories from the team</h1>
                <p className={styles.lead}>Test days, competitions, events and everyday life in Norway&apos;s first solar racing team.</p>
                {groups.length > 2 && <div className={styles.filters} role="group" aria-label="Filter by group">
                    {groups.map((name) => <button key={name} type="button" aria-pressed={group === name}
                        className={styles.filter} onClick={() => setGroup(name)}>{name}</button>)}
                </div>}
            </header>
            {error && <p role="alert">{error}</p>}
            {!error && !shown.length && <p>No published articles yet.</p>}
            {featured && <article className={styles.featured}>
                <Link href={href(featured)} className={styles.featuredImage} tabIndex={-1} aria-hidden="true">
                    {featured.cover ? <img src={featured.cover.url} alt="" /> : <span className={styles.placeholder} />}
                </Link>
                <div className={styles.featuredText}>
                    <Meta post={featured} />
                    <h2><Link href={href(featured)}>{featured.title}</Link></h2>
                    <p>{featured.excerpt}</p>
                    <Link href={href(featured)} className={styles.readMore}>Read the story <span aria-hidden="true">→</span></Link>
                </div>
            </article>}
            {rest.length > 0 && <div className={styles.grid}>{rest.map((post) => <article key={post.id} className={styles.card}>
                <Link href={href(post)} className={styles.cardImage} tabIndex={-1} aria-hidden="true">
                    {post.cover ? <img src={post.cover.url} alt="" loading="lazy" /> : <span className={styles.placeholder} />}
                </Link>
                <div className={styles.cardText}>
                    <Meta post={post} />
                    <h2><Link href={href(post)}>{post.title}</Link></h2>
                    <p>{post.excerpt}</p>
                </div>
            </article>)}</div>}
        </section>
    </div>;
}

function Photo({ photo, loading = 'lazy' }) {
    return <img src={photo.url} alt={photo.alt} width={photo.width || undefined} height={photo.height || undefined} loading={loading} />;
}

function Nodes({ nodes }) {
    return nodes.map((node, index) => {
        if (node.type === 'text') {
            let text = node.text;
            if (node.format & 1) text = <strong>{text}</strong>;
            if (node.format & 2) text = <em>{text}</em>;
            if (node.format & 4) text = <s>{text}</s>;
            if (node.format & 8) text = <u>{text}</u>;
            if (node.format & 16) text = <code>{text}</code>;
            return <span key={index}>{text}</span>;
        }
        if (node.type === 'linebreak') return <br key={index} />;
        if (node.type === 'photo') return <figure key={index} className={`${styles.figure} ${styles[node.layout] || ''}`}>
            <Photo photo={node.photo} />{node.caption && <figcaption>{node.caption}</figcaption>}
        </figure>;
        if (node.type === 'video') return <Video key={index} node={node} />;
        if (node.type === 'photoRow') return <figure key={index} className={styles.row} style={{ '--row-count': node.photos.length }}>
            <div className={styles.rowPhotos}>{node.photos.map((photo, i) => <Photo key={i} photo={photo} />)}</div>
            {node.caption && <figcaption>{node.caption}</figcaption>}
        </figure>;
        const children = <Nodes nodes={node.children || []} />;
        if (node.type === 'link') return node.url ? <a key={index} href={node.url} rel="noopener noreferrer">{children}</a> : <span key={index}>{children}</span>;
        const Tag = node.type === 'heading' ? node.tag === 'h3' ? 'h3' : 'h2' : node.type === 'quote' ? 'blockquote' : node.type === 'list' ? node.tag === 'ol' ? 'ol' : 'ul' : node.type === 'listitem' ? 'li' : 'p';
        return <Tag key={index}>{children}</Tag>;
    });
}

export function CmsArticle({ post }) {
    return <div className={styles.page}>
        <article className={styles.article}>
            <header className={styles.articleHeader}>
                <Link href="/blog" className={styles.back}>← All stories</Link>
                <Meta post={post} />
                <h1>{post.title}</h1>
                {post.summary && <p className={styles.summary}>{post.summary}</p>}
                {post.author && <p className={styles.byline}>By {post.author}</p>}
            </header>
            {post.cover && <figure className={styles.cover}><Photo photo={post.cover} loading="eager" /></figure>}
            <div className={styles.reading}>
                <Nodes nodes={post.nodes} />
            </div>
            {post.gallery.length > 0 && <section aria-labelledby="gallery-title" className={styles.gallerySection}>
                <h2 id="gallery-title">More photos</h2>
                <div className={styles.gallery}>{post.gallery.map((photo, index) => <a key={index} href={photo.url} target="_blank" rel="noreferrer"><Photo photo={photo} /></a>)}</div>
            </section>}
            <footer className={styles.articleEnd}>
                <span>Nordlys NTNU</span>
                <Link href="/blog">More stories from the team →</Link>
            </footer>
        </article>
    </div>;
}
