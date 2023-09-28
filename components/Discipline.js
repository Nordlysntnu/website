import { useRef } from 'react';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import styles from '../styles/Discipline.module.css';
import Link from 'next/Link';

export default function Discipline({ title, image, delay }) {
    return (
        <AnimationOnScroll animateIn="animate__fadeInUp" animateOnce delay={delay? delay : 0} >
            <Link href="/join" className={styles.container}>
                <div className={styles.imageContainer}>
                    <img src={image} className={styles.image} />
                </div>
                <div className={styles.title}>{title}</div>
            </Link>
        </AnimationOnScroll>
    )
}