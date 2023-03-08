import Content from "./Content";
import GoalCard from "./GoalCard";
import styles from '../styles/GoalPane.module.css';
import Image25 from '../public/2025Goal.png';
import ImageTeam from '../public/TeamGoal.png';
import ImageNorway from '../public/NorwayGoal.png';

export default function GoalPane({ dark }) {
    return (
        <Content dark={dark}>
            <div className={styles.container}>
                <GoalCard delay={200} image={ImageTeam.src} title="Full team in August" text="We want to have a full team of 30 members by August 2023." />
                <GoalCard delay={400} image={Image25.src} title="Compete in 2025" text="We aim to compete already in 2025." />
                <GoalCard delay={600} image={ImageNorway.src} title="Drive the length of Norway" text="We want to drive the length of Norway only on Solar power." />
            </div>
        </Content>
    )
}