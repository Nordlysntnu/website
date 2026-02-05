import Image from 'next/image'
import styles from './styles/DoubleImage.module.css';

export default function DoubleImage({ imageFront, imageBack }) {
    const imageWidth = 774;
    const imageHeight = 558;

    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <Image src={imageFront} className={styles.image} loading="lazy" fill width={0} height={0} placeholder="empty" />
                <Image src={imageBack} className={styles.image} loading="lazy" width={0} height={0} placeholder="empty" />
            </div>
        </div>
    )
}
