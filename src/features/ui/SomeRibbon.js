import Link from 'next/link';
import styles from '../styles/SomeRibbon.module.css';
import Instagram from '../public/Instagram.svg';
import Facebook from '../public/Facebook.svg';
import Linkedin from '../public/Linkedin.svg';

export default function SomeRibbon() {
    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <Link className={styles.icon} target="_blank" href="https://www.instagram.com/nordlysntnu/">
                    <img src={Instagram.src} />
                </Link>
                <Link className={styles.icon} target="_blank" href="https://www.linkedin.com/company/nordlysntnu/">
                    <img src={Linkedin.src} />
                </Link>
                <Link className={styles.icon} target="_blank" href="https://www.facebook.com/nordlysntnu">
                    <img src={Facebook.src} />
                </Link>
            </div>
        </div>
    )
}