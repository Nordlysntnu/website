import styles from '../styles/Disciplines.module.css';
import Discipline from './Discipline';
import Mechanical from '../public/Mechanical.png';
import Software from '../public/Software.png';
import EmbeddedElectronics from '../public/EmbeddedElectronics.png';
import PowerElectronics from '../public/PowerElectronics.png';
import Design from '../public/Design.png';
import Management from '../public/Management.png';
import Content from './Content';

export default function Disciplines({ dark }) {return (
        <Content>
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <h1 className={styles.title}>Our groups</h1>
                    <div className={styles.contentContainer}>
                        <Discipline delay={100} image={EmbeddedElectronics.src} title="Embedded Electronics" />
                        <Discipline delay={150} image={PowerElectronics.src} title="Power Electronics" />
                        <Discipline delay={100} image={Software.src} title="Software" />
                        <Discipline delay={50} image={Design.src} title="Design" />
                        <Discipline delay={150} image={Mechanical.src} title="Mechanical" />
                        <Discipline delay={100} image={Management.src} title="Management" />
                    </div>
                </div>
            </div>
        </Content>
    )
}