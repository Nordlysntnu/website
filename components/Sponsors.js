import styles from '../styles/Sponsors.module.css';
import Content from './Content';
import Sponsor from './Sponsor';
import Link from 'next/Link';

export default function Sponsors({ sponsors, title, dark, platinum }) {
    return (
        <Content dark={dark}>
            <center>
                {platinum ? <h1 className={styles.title}>{title}</h1> : <h2 className={styles.title}>{title}</h2>}
            </center>
            <div className={platinum ? styles.platinumContainer : styles.container}>
                {
                    Object.keys(sponsors).map((sponsorName, i) => {
                        return (
                            <Sponsor platinum={platinum ? platinum : false} name={sponsorName} image={sponsors[sponsorName].image} link={sponsors[sponsorName].link} description={sponsors[sponsorName].description} />
                        )
                    })
                }
            </div>
        </Content>
    )
}