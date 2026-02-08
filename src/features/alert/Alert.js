import Link from 'next/link';
import styles from './styles/Alert.module.css';

export default function Alert({ alert, onClose }) {
    const {name, info, description, link, linkText} = alert;
    return (
        <div className={styles.container}>
            <button className={styles.close} onClick={onClose}>x</button>

            <div className={styles.title}>
                <div className={styles.titleText}>{name}</div>
                <div className={styles.info}>{info}</div>
            </div>
            <div className={styles.description}>{description}</div>
            <Link className={styles.link} href={link} scroll={true}>{linkText}</Link> {/*target="_blank"*/}
        </div>
    );
}