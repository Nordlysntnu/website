import styles from '../styles/Content.module.css';

export default function Content({ children, dark, blue, id, nopad = false}) {
    return (
        <div id={id ? id : null} className={dark ? `${styles.container} ${styles.darkContainer}` : blue ? '${styles.blue} ${styles.container}' : styles.container} style ={nopad ? {'padding': '0em 0em 0em 0em'} : {}}>
            <div className={styles.innerContainer}>
                {children}
            </div>
        </div>
    )
}