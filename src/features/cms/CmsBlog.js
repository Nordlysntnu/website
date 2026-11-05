import Link from 'next/link';
import styles from './CmsBlog.module.css';

export function CmsPostList({ posts, error }) {
    return <section className={styles.container}><h1>Stories from the team</h1>
        {error && <p role="alert">{error}</p>}
        {!error && !posts.length && <p>No published articles yet. Publish a draft in the local CMS, then refresh.</p>}
        <div className={styles.grid}>{posts.map((post) => <article key={post.id} className={styles.card}>
            {post.cover && <Link href={'/blog/' + post.id}><img src={post.cover.url} alt={post.cover.alt} /></Link>}
            <p>{post.department} · {date(post.publishedAt)}</p><h2><Link href={'/blog/' + post.id}>{post.title}</Link></h2>
            <p>{post.excerpt}</p><Link href={'/blog/' + post.id}>Read article →</Link>
        </article>)}</div>
    </section>;
}
function date(value) {
    return Number.isNaN(Date.parse(value)) ? '' : new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'Europe/Oslo' }).format(new Date(value));
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
        if (node.type === 'photo') return <figure key={index}><img src={node.photo.url} alt={node.photo.alt} />{node.caption && <figcaption>{node.caption}</figcaption>}</figure>;
        const children = <Nodes nodes={node.children || []} />;
        if (node.type === 'link') return node.url ? <a key={index} href={node.url} rel="noopener noreferrer">{children}</a> : <span key={index}>{children}</span>;
        const Tag = node.type === 'heading' ? node.tag === 'h3' ? 'h3' : 'h2' : node.type === 'quote' ? 'blockquote' : node.type === 'list' ? node.tag === 'ol' ? 'ol' : 'ul' : node.type === 'listitem' ? 'li' : 'p';
        return <Tag key={index}>{children}</Tag>;
    });
}
export function CmsArticle({ post }) {
    return <article className={styles.container}><Link href="/blog">← All updates</Link>
        <header><p>{post.department} · {date(post.publishedAt)}</p><h1>{post.title}</h1>
            {post.author && <p>By {post.author}</p>}{post.summary && <p className={styles.intro}>{post.summary}</p>}</header>
        {post.cover && <img className={styles.cover} src={post.cover.url} alt={post.cover.alt} />}
        <div className={styles.reading}><Nodes nodes={post.nodes} />
            {post.gallery.length > 0 && <section aria-label="Photo gallery" className={styles.gallery}>{post.gallery.map((photo, index) => <a key={index} href={photo.url} target="_blank" rel="noreferrer"><img src={photo.url} alt={photo.alt} /></a>)}</section>}
        </div>
    </article>;
}
