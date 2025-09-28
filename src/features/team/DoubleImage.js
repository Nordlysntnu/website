import Image from 'next/image'
import styles from './styles/DoubleImage.module.css';

export default function DoubleImage({ imageFront, imageBack }) {
    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <Image src={imageFront} width={800} height={500} className={styles.image} loading="lazy" placeholder="empty" />
                <Image src={imageBack} width={800} height={500} className={styles.image} loading="lazy" placeholder="empty" />
            </div>
        </div>
    )
}

// <Image src={imageFront} width={800} height={500} className={styles.image} loading="lazy" placeholder="empty" />
// <Image src={imageBack} width={800} height={500} className={styles.image} loading="lazy" placeholder="empty" />
