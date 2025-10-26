import Email from '@assets/symbols-and-logos/email.svg'
import Linkedin from '@assets/symbols-and-logos/Linkedin.svg'
import Phone from '@assets/symbols-and-logos/telephone.svg'
import styles from './styles/ContactRibbon.module.css'

export default function ContactRibbon( {email, linkedin, phone}) {
    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <a className={styles.icon} href={`mailto:${email}`}>
                <img src={Email.src} alt="Email" />
                </a>

                {linkedin && (
                    <a className={styles.icon} href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank" rel="noopener noreferrer" >
                    <img src={Linkedin.src} alt="LinkedIn" />
                    </a>
                )}

                {phone && (
                    <a className={styles.icon} href={`tel:${phone}`}>
                        <img src={Phone.src} alt="Phone" />
                    </a>
                )}
            </div>
        </div>
    )
}