import Link from 'next/link';
import styles from './styles/Disciplines.module.css';
import Discipline from './Discipline';
import { groupIcons } from '@features/ui/groupIcons';
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
                    <Discipline icon={groupIcons.board} title="Board" />
                    <Discipline icon={groupIcons.business} title="Business" />
                    <Discipline icon={groupIcons.marketing} title="Marketing" />
                    <Discipline icon={groupIcons.logistics} title="Logistics" />
                    <Discipline icon={groupIcons['aero-&-composites']} title="Aero & Composites" />
                    <Discipline icon={groupIcons.mechanical} title="Mechanical" />
                    <Discipline icon={groupIcons.electrical} title="Electrical" />
                    <Discipline icon={groupIcons.software} title="Software" />
                </div>
            </section>
        </Content>
    );
}
