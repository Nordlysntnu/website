import Link from 'next/link';
import styles from './styles/SomeRibbon.module.css';
import Instagram from '@assets/symbols-and-logos/Instagram.svg';
import Facebook from '@assets/symbols-and-logos/Facebook.svg';
import Linkedin from '@assets/symbols-and-logos/Linkedin.svg';

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