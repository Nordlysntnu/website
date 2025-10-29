import styles from './styles/Disciplines.module.css';
import Discipline from './Discipline';
import Mechanical from '@assets/symbols-and-logos/Mechanical.png';
import Chassis from '@assets/symbols-and-logos/Chassis.png';
import Software from '@assets/symbols-and-logos/Software.png';
import EmbeddedElectronics from '@assets/symbols-and-logos/EmbeddedElectronics.png';
import Brand from '@assets/symbols-and-logos/Brand.png';
import Logistics from '@assets/symbols-and-logos/Logistics.png';
import Management from '@assets/symbols-and-logos/Management.png';
import Content from '@shared/components/Content';

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
