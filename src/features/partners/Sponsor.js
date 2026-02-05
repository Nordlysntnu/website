import Link from 'next/link';
import Image from 'next/image'
import styles from './styles/Sponsor.module.css';

export default function Sponsor({ name, platinum, description, link, image }) {
    const mainHeight = 300;
    const mainWidth = 300;

    const regularHeight = 250;
    const regularWidth = 250;
    return (
        <Link href={link ? link : ""} target='_blank' className={platinum ? styles.platinumContainer : styles.container}>
            <Image className={styles.image} src={image ? image : ""} width={platinum ? mainWidth : regularWidth} height={platinum ? mainHeight : regularHeight} />
            {platinum ?             
                <div className={styles.textContainer}>
                    <p className={styles.description}>{description ? description : ""}</p>
                </div> 
            :
                <></>
            }   
        </Link>
    )
}
