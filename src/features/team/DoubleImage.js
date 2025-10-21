import Image from 'next/image'
import styles from './styles/DoubleImage.module.css';

export default function DoubleImage({ imageFront, imageBack }) {
    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <Image src={imageFront} className={styles.image} loading="lazy" placeholder="empty" />
                <Image src={imageBack} className={styles.image} loading="lazy" placeholder="empty" />
            </div>
        </div>
    )
}
