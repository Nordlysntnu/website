import Link from 'next/Link';
import styles from '../styles/TeamMember.module.css';

export default function TeamMember({ name, position, image, email }) {
    const baseURL = image ? image : "Unknown.png"
    const imageURL = '/Members/2025/' + baseURL
    const emailLink = email ? "mailto:" + email : "#"
    return(
        <Link href={emailLink} className={styles.container}>
            <img className={styles.image} src={imageURL} />
            <div className={styles.textContainer}>
                <p className={styles.name}>{name}</p>
                <p className={styles.position}>{position}</p>
            </div>
            {email ? <div className={styles.link}>{"Contact"}</div> : <></>}
        </Link>
    )
}