import styles from './styles/Sponsors.module.css';
import Content from '@shared/components/Content';
import Sponsor from '@shared/components/Sponsor';
import Link from 'next/link';

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