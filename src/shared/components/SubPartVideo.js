import Link from 'next/link';
import styles from '../styles/SubPart1.module.css';
import Content from './Content';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import { useEffect, useRef, useState } from 'react';

export default function SubPartVideo({ dark, video, poster, title, text, link, linkText }) {
    const videoRef = useRef(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setShouldLoad(true);
                observer.disconnect;
            }
        }, 
        {threshold: 0.25}
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

    return (
        <Content dark={dark}>
            <div className={styles.container}>
                <div className={styles.imageContainer}>
                    <AnimationOnScroll animateIn='animate__fadeIn' animateOnce>
                        {shouldLoad ? (
                            <video autoPlay muted loop playsInline poster={poster} className={styles.image}>
                            <source src={video} type="video/mp4" />
                        </video>

                        ) : (
                            <img src={poster} alt={title} className={styles.image} />
                        )}
                    </AnimationOnScroll>
                </div>
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.text}>{text}</p>
                    {link? <Link href={link} className={styles.link}>{linkText? linkText : "Read more"}</Link> : <></>}
                </div>
            </div>
        </Content>
    );
}