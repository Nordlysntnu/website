import styles from '../styles/DoubleImage.module.css';

export default function DoubleImage({ imageFront, imageBack }) {
    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <img src={imageFront} className={styles.image} />
                <img src={imageBack} className={styles.image} />
            </div>
        </div>
    )
}