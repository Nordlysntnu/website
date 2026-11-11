import Link from 'next/link';
import Image from 'next/image'
import styles from '../styles/SubPart1.module.css';
import Content from './Content';
import ScrollReveal from './ScrollReveal';

export default function SubPart1({ dark, image, title, text, link, linkText }) {
    return (
        <Content dark={dark}>
            <div className={styles.container}>
                <div className={styles.imageContainer}>
                    <ScrollReveal animateIn='animate__fadeIn'>
                        <Image className={styles.image} src={image} width={400} height={250} loading="lazy" placeholder="empty" />
                    </ScrollReveal>
                </div>
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.text}>{text}</p>
                    {link? <Link href={link} className={styles.link}>{linkText? linkText : "Read more"}</Link> : <></>}
                </div>
            </div>
        </Content>
    )
}
