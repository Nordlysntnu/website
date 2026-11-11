import Image from 'next/image';
import Link from 'next/link';
import { blogs } from '@shared/data/blog';
import styles from '@shared/styles/BlogContainer.module.css';

export default function BlogPreview({ cmsPosts = null, cmsError = null }) {
    const cms = Array.isArray(cmsPosts);
    const latest = cms ? cmsPosts[0] : blogs[0];
    if (!latest) return cmsError ? <p role="alert">{cmsError}</p> : null;
    const images = cms ? (latest.cover ? [latest.cover.url] : []) : latest.images || [];
    const date = cms ? new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'Europe/Oslo' }).format(new Date(latest.publishedAt)) : latest.date;
    const href = cms ? '/blog/' + (latest.slug || latest.id) : '/blog#latest-post';
    return (
        <section className={styles.container} aria-labelledby="latest-update-title">
            <div className={styles.innerContainer}>
                <div className={styles.heading}>
                    <div><p className={styles.eyebrow}>From the blog</p><h2 id="latest-update-title" className={styles.headline}>Latest from Nordlys</h2></div>
                    <Link href="/blog" className={styles.link}>All updates <span aria-hidden="true">→</span></Link>
                </div>
                <article className={[styles.post, images.length ? '' : styles.textOnly].join(' ')} aria-label={'Update from ' + date}>
                    {images.length > 0 && (
                        <Link href={href} className={styles.imageLink} aria-label={'Read our ' + date + ' update'}>
                            <Image src={images[0]} alt="" width={750} height={500} sizes="(min-width: 1440px) 380px, (min-width: 650px) 40vw, 100vw" className={styles.image} />
                            {images.length > 1 && <span className={styles.imageCount} aria-hidden="true">{images.length} photos</span>}
                        </Link>
                    )}
                    <div className={styles.postText}>
                        <p className={styles.date}>{date}</p>
                        {cms && <h3>{latest.title}</h3>}
                        <p className={styles.excerpt}>{cms ? latest.excerpt : latest.text}</p>
                        <Link href={href} className={styles.readLink}>Read update <span aria-hidden="true">→</span></Link>
                    </div>
                </article>
            </div>
        </section>
    );
}
