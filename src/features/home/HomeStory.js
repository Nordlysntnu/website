import Content from '@shared/components/Content';
import Image from 'next/image';
import Link from 'next/link';
import styles from './styles/HomeStory.module.css';

export default function HomeStory() {
    return (
        <Content dark={true}>
            <section className={styles.container} aria-labelledby="home-story-title">
                <figure>
                    <Image
                        src="/blog/compressed/rudskogen.webp"
                        alt="Nordlys team members with Lumholtz and its solar panels at Rudskogen"
                        width={893}
                        height={500}
                        sizes="(min-width: 1440px) 620px, (min-width: 900px) 45vw, 100vw"
                        className={styles.image}
                    />
                    <figcaption className={styles.caption}>Testing Lumholtz at Rudskogen</figcaption>
                </figure>
                <div className={styles.copy}>
                    <p className={styles.eyebrow}>The Nordlys project</p>
                    <h2 id="home-story-title" className={styles.title}>The impact of creating</h2>
                    <p className={styles.text}>
                        There&apos;s nothing more valuable than creating something new. Through developing solar powered cars and competing in some of the world&apos;s biggest solar racing competitions, Nordlys NTNU aims to educate the best engineers in Norway, and showcase optimism and innovation in a world in dire need of sustainable energies.
                    </p>
                    <Link href="/about" className={styles.link}>About us <span aria-hidden="true">→</span></Link>
                </div>
            </section>
        </Content>
    );
}
