import styles from '../styles/Content.module.css';

export default function Content({ children, dark, blue, id }) {
    return (
        <div id={id ? id : null} className={dark ? `${styles.container} ${styles.darkContainer}` : blue ? '${styles.blue} ${styles.container}' : styles.container}>
            <div className={styles.innerContainer}>
                {children}
            </div>
        </div>
    )
}