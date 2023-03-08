import styles from '../styles/Landing.module.css';
import Link from 'next/Link';
import { AnimationOnScroll } from 'react-animation-on-scroll';

export default function Landing() {
    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <video autoPlay muted loop poster="Ribbon.png" className={styles.ribbon}>
                    <source src="RibbonWStars.mp4" type="video/mp4" />
                </video>
            </div>
            <AnimationOnScroll animateIn='animate__fadeIn' offset={0} delay={0} animateOnce>
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>A New Era is Here</h1>
                    <div className={styles.text}>Push the limits of technology with the largest interdisciplinary bachelor's and master's project ever at NTNU</div>
                    <Link href="/join" className={styles.button}>Join</Link>
                </div>
            </AnimationOnScroll>
        </div>
    )
}