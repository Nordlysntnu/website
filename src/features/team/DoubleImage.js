import Image from 'next/image'
import styles from './styles/DoubleImage.module.css';

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

// <Image src={imageFront} width={800} height={500} className={styles.image} loading="lazy" placeholder="empty" />
// <Image src={imageBack} width={800} height={500} className={styles.image} loading="lazy" placeholder="empty" />