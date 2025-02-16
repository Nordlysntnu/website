import { useRef } from 'react';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import styles from '../styles/Discipline.module.css';
import Link from 'next/link';
export default function Discipline({ title, image, delay }) {
    // Lag en slug for teamnavnet som kan brukes i URL-en (eksempel: "Board" -> "board")
    const teamSlug = title.replace(/\s+/g, '').toLowerCase(); // Fjerner mellomrom og gjør om til små bokstaver
    return (
        <AnimationOnScroll animateIn="animate__fadeInUp" animateOnce delay={delay ? delay : 0}>
            <Link href={`/team?group=${teamSlug}`} className={styles.container}>
                <div className={styles.imageContainer}>
                    <img src={image} className={styles.image} />
                </div>
                <div className={styles.title}>{title}</div>
            </Link>
        </AnimationOnScroll>
    );
}