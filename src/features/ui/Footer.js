import styles from './styles/Footer.module.css';
import Link from 'next/link';
import Content from '@shared/components/Content';
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
                    <p>Klæbuveien 153</p>
                    <p>7031</p>
                    <p>Trondheim</p>
                </div>
                <div className={styles.textContainer}>
                    <p>Visitor address:</p>
                    <p>Klæbuveien 153</p>
                    <p>7031</p>
                    <p>Trondheim</p>
                </div>
                <div className={styles.textContainer}>
                    <p>Contact information:</p>
                    <Link href="mailto:rasmus.nummelin@nordlysntnu.no">rasmus.nummelin@nordlysntnu.no</Link>
                    <p><Link href="tel:004798054190">+47 980 54 190</Link></p>
                </div>
            </div>
            <center>Created by and for students.</center>
        </Content>
        </>
    )
}