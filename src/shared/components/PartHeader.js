import styles from './styles/PartHeader.module.css';

export default function PartHeader({ darkColor, title, text }) {
    return (
        <div className={styles.textContainer}>
            <h1 className={darkColor? styles.darkColor : styles.lightColor}>
                {title}
            </h1>
            <p className={styles.text}>
                {text}
            </p>
        </div>
    )
}