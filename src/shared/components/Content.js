import styles from './styles/Content.module.css';

export default function Content({ children, dark, id }) {
    return (
        <div id={id ? id : null} className={dark ? `${styles.container} ${styles.darkContainer}` : styles.container}>
            <div className={styles.innerContainer}>
                {children}
            </div>
        </div>
    )
}