import Content from "./Content";
import styles from '../styles/MapPane.module.css';
import Link from 'next/Link';
import MapContainer from "./MapContainer";
import { AnimationOnScroll } from "react-animation-on-scroll";

export default function MapPane({ dark }) {
    return (
        <Content dark={dark}>
            <div className={styles.container}>
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>The challenge</h1>
                    <p className={styles.text}>Our aim is to compete in solar racing competitions and showcase the strength of solar technologies. The biggest such even is the World Solar Challenge, a six-day race across the emptiness of Australia.</p>
                    <Link href={"/about"} className={styles.link}>About us</Link>
                </div>
                <div className={styles.mapFrame}>
                    <MapContainer />
                </div>
            </div>
        </Content>
    )
}