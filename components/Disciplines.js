import styles from '../styles/Disciplines.module.css';
import Discipline from './Discipline';
import Mechanical from '../public/Mechanical.png';
import Chassis from '../public/Chassis.png';
import Software from '../public/Software.png';
import EmbeddedElectronics from '../public/EmbeddedElectronics.png';
import Brand from '../public/Brand.png';
import Logistics from '../public/Logistics.png';
import Management from '../public/Management.png';
import Content from './Content';

export default function Disciplines({ dark }) {return (
        <Content dark={dark}>
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <h1 className={styles.title}>Our groups</h1>
                    <div className={styles.contentContainer}>
                        <Discipline delay={100} image={EmbeddedElectronics.src} title="Electrical" />
                        <Discipline delay={100} image={Software.src} title="Software" />
                        <Discipline delay={100} image={Logistics.src} title="Logistics" />
                        <Discipline delay={100} image={Mechanical.src} title="Mechanical" />
                        <Discipline delay={300} image={Chassis.src} title="Chassis" />
                        <Discipline delay={300} image={Brand.src} title="Brand" />
                        <Discipline delay={300} image={Management.src} title="Board" />
                    </div>
                </div>
            </div>
        </Content>
    )
}
