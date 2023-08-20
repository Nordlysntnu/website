import styles from '../styles/Footer.module.css';
import Link from 'next/Link';
import Content from './Content';
import ContactPane from './ContactPane';

export default function Footer() {
    const toTop = () => window.scrollTo({top: 0, behavior: 'smooth'})

    return (
        <>
        <div className={styles.topRibbon}>
            <button className={styles.innerContainer} onClick={toTop}>
                <span>To the top</span>
            </button>
        </div>
        <Content dark={true}>
            <p className={styles.header}>Contact Us</p>
            <ContactPane />
            <div className={styles.container}>
                <div className={styles.textContainer}>
                    <p>Post address:</p>
                    <p>Herman Krags veg 31</p>
                    <p>7050</p>
                    <p>Trondheim</p>
                </div>
                <div className={styles.textContainer}>
                    <p>Visitor address:</p>
                    <p>Herman Krags vei 31</p>
                    <p>7050</p>
                    <p>Trondheim</p>
                </div>
                <div className={styles.textContainer}>
                    <p>Contact information:</p>
                    <Link href="mailto:sivert.kverme@nordlysntnu.no">sivert.kverme@nordlysntnu.no</Link>
                    <p><Link href="tel:004790252412">+47 902 52 412</Link></p>
                </div>
            </div>
            <center>Created by and for students.</center>
        </Content>
        </>
    )
}