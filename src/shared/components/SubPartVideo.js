import Link from 'next/link';
import styles from './styles/SubPart1.module.css';
import Content from './Content';
import { AnimationOnScroll } from 'react-animation-on-scroll';

export default function SubPartVideo({ dark, video, poster, title, text, link, linkText }) {
    return (
        <Content dark={dark}>
            <div className={styles.container}>
                <div className={styles.imageContainer}>
                    <AnimationOnScroll animateIn='animate__fadeIn' animateOnce>
                        <video autoPlay muted loop playsInline poster={poster} className={styles.image}>
                            <source src={video} type="video/mp4" />
                        </video>
                    </AnimationOnScroll>
                </div>
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.text}>{text}</p>
                    {link? <Link href={link} className={styles.link}>{linkText? linkText : "Read more"}</Link> : <></>}
                </div>
            </div>
        </Content>
    )
}