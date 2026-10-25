import Image from 'next/image';
import Link from 'next/link';
import styles from '@features/home/styles/HomeLanding.module.css';

export default function Landing() {
    return (
        <section id="home-content" className={styles.container} aria-labelledby="home-title">
            <div className={styles.background} aria-hidden="true">
                <video autoPlay muted loop playsInline preload="none" poster="/posters/compressed/Ribbon.jpg">
                    <source src="/videos/compressed/Stars.webm" type="video/webm" />
                </video>
            </div>
            <div className={styles.innerContainer}>
                <div className={styles.copy}>
                    <p className={styles.eyebrow}>Nordlys NTNU · Solar racing</p>
                    <h1 id="home-title" className={styles.title}>
                        Fueled by solar,<br />driven by passion
                    </h1>
                    <p className={styles.text}>
                        Push the limits of technology with the first ever solar racing team from Norway.
                    </p>
                    <div className={styles.actions}>
                        <Link href="/join" className={styles.primaryLink}>
                            Join Nordlys <span aria-hidden="true">↗</span>
                        </Link>
                        <Link href="/team" className={styles.secondaryLink}>
                            Meet the team <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
                <figure className={styles.figure}>
                    <Image
                        src="/blog/compressed/dragvoll1.webp"
                        alt="Lumholtz, Nordlys NTNU's solar race car, during testing at Dragvoll"
                        width={750}
                        height={500}
                        sizes="(min-width: 1440px) 680px, (min-width: 900px) 50vw, 100vw"
                        priority
                        className={styles.image}
                    />
                    <figcaption className={styles.caption}>
                        <span>Lumholtz</span>
                        <span>Our first solar race car</span>
                    </figcaption>
                </figure>
            </div>
        </section>
    );
}
