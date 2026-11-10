import Link from 'next/link';
import styles from '@features/home/styles/HomeLanding.module.css';

export default function Landing() {
    return (
        <section id="home-content" className={styles.container} aria-labelledby="home-title">
            <img
                className={styles.image}
                src="/home/lumholtz-1600.webp"
                srcSet="/home/lumholtz-960.webp 960w, /home/lumholtz-1600.webp 1600w"
                sizes="100vw"
                width={1600}
                height={1067}
                alt="Lumholtz, Nordlys NTNU's solar race car, on the road at Dragvoll"
                fetchPriority="high"
            />
            <div className={styles.shade} aria-hidden="true" />
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
                <p className={styles.caption}>
                    <span>Lumholtz</span> Our first solar race car
                </p>
            </div>
        </section>
    );
}
