import Link from 'next/link';
import styles from './styles/Disciplines.module.css';
import Discipline from './Discipline';
import Mechanical from '@assets/symbols-and-logos/Mechanical.png';
import AeroAndComposites from '@assets/symbols-and-logos/Chassis.png';
import Software from '@assets/symbols-and-logos/Software.png';
import EmbeddedElectronics from '@assets/symbols-and-logos/EmbeddedElectronics.png';
import Marketing from '@assets/symbols-and-logos/Marketing.png';
import Logistics from '@assets/symbols-and-logos/Logistics.png';
import Management from '@assets/symbols-and-logos/Management.png';
import Board from '@assets/symbols-and-logos/Board.png';
import Content from '@shared/components/Content';

export default function Disciplines({ dark }) {
    return (
        <Content dark={dark}>
            <section aria-labelledby="home-groups-title">
                <div className={styles.header}>
                    <h2 id="home-groups-title" className={styles.title}>Our groups</h2>
                    <Link href="/team" className={styles.link}>Meet the team <span aria-hidden="true">→</span></Link>
                </div>
                <div className={styles.contentContainer}>
                    <Discipline image={Board.src} title="Board" />
                    <Discipline image={Management.src} title="Business" />
                    <Discipline image={Marketing.src} title="Marketing" />
                    <Discipline image={Logistics.src} title="Logistics" />
                    <Discipline image={AeroAndComposites.src} title="Aero & Composites" />
                    <Discipline image={Mechanical.src} title="Mechanical" />
                    <Discipline image={EmbeddedElectronics.src} title="Electrical" />
                    <Discipline image={Software.src} title="Software" />
                </div>
            </section>
        </Content>
    );
}
