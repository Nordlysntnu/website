import styles from '../styles/Landing.module.css';

export default function PageLanding({ title, text, image }) {
    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <img className={styles.ribbon} src={image} priority={true} />
            </div>
            <div className={styles.textContainer}>
                <h1 className={styles.title}>{title}</h1>
                <div className={styles.text}>{text}</div>
            </div>
        </div>
    )
}