import styles from './styles/Landing.module.css';
import Link from 'next/link';
import { useRef, useState } from 'react';

export default function Landing() {    
    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <video autoPlay muted loop playsInline poster="Ribbon.png" className={styles.ribbon}>
                    <source src="RibbonWStars.mp4" type="video/mp4" />
                </video>
            </div>
            <div className={styles.textContainer}>
                <h1 className={styles.title}>Fueled by solar, driven by passion</h1>
                <div className={styles.text}>Push the limits of technology with the first ever solar racing team from Norway.</div>
                <Link href="/join" className={styles.button}>Join</Link>
            </div>
        </div>
    )
}