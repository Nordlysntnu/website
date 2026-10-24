import Image from 'next/image';
import Link from 'next/link';
import { blogs } from '@shared/data/blog';
import styles from '@shared/styles/BlogContainer.module.css';

export default function BlogPreview() {
    const latest = blogs[0];

    if (!latest) return null;

    const images = latest.images || [];

    return (
        <section className={styles.container} aria-labelledby="latest-update-title">
            <div className={styles.innerContainer}>
                <div className={styles.heading}>
                    <div>
                        <p className={styles.eyebrow}>From the blog</p>
                        <h2 id="latest-update-title" className={styles.headline}>Latest from Nordlys</h2>
                    </div>
                    <Link href="/blog" className={styles.link}>All updates <span aria-hidden="true">→</span></Link>
                </div>
                <article className={[styles.post, images.length ? '' : styles.textOnly].join(' ')} aria-label={'Update from ' + latest.date}>
                    {images.length > 0 && (
                        <Link href="/blog#latest-post" className={styles.imageLink} aria-label={'Read our ' + latest.date + ' update and view all photos'}>
                            <Image
                                src={images[0]}
                                alt=""
                                width={750}
                                height={500}
                                sizes="(min-width: 1440px) 380px, (min-width: 650px) 40vw, 100vw"
                                className={styles.image}
                            />
                            {images.length > 1 && <span className={styles.imageCount} aria-hidden="true">{images.length} photos</span>}
                        </Link>
                    )}
                    <div className={styles.postText}>
                        <p className={styles.date}>{latest.date}</p>
                        <p className={styles.excerpt}>{latest.text}</p>
                        <Link href="/blog#latest-post" className={styles.readLink}>Read update <span aria-hidden="true">→</span></Link>
                    </div>
                </article>
            </div>
        </section>
    );
}
