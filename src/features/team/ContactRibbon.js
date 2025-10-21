import Instagram from '@assets/symbols-and-logos/Instagram.svg';
import styles from './styles/ContactRibbon.module.css'

export default function ContactRibbon( {email, linkedin, phone}) {
    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <a className={styles.icon} href={`mailto:${email}`}>
                <img src={Instagram.src} alt="Email" />
                </a>

                {linkedin && (
                    <a className={styles.icon} href={linkedin}>
                    <img src={Instagram.src} alt="LinkedIn" />
                    </a>
                )}

                {phone && (
                    <a className={styles.icon} href={`tel:${phone}`}>
                        <img src={Instagram.src} alt="Phone" />
                    </a>
                )}
            </div>
        </div>
    )
}