import Link from 'next/Link';
import styles from '../styles/SomeRibbon.module.css';
import Instagram from '../public/Instagram.svg';
import Facebook from '../public/Facebook.svg';
import Linkedin from '../public/Linkedin.svg';

export default function SomeRibbon() {
    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <Link className={styles.icon} href="#">
                    <img src={Instagram.src} />
                </Link>
                <Link className={styles.icon} href="#">
                    <img src={Linkedin.src} />
                </Link>
                <Link className={styles.icon} href="#">
                    <img src={Facebook.src} />
                </Link>
            </div>
        </div>
    )
}