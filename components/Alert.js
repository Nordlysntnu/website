import Link from 'next/link';
import styles from '../styles/Alert.module.css';

export default function Alert({alert}) {
    const {name, info, description, url, linkText} = alert;
    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <div className={styles.titleText}>
                    {name}
                </div>
                <div className={styles.info}>
                    {info}
                </div>
            </div>
            <div className={styles.description}>
                {description}
            </div>
            <Link className={styles.link} target="_blank" href={url}>{linkText}</Link>
        </div>
    )
}