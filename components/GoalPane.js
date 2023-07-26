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
                <GoalCard delay={200} image={ImageTeam.src} title="Ambition" text="We aim to become the best solar racing team in the world." />
                <GoalCard delay={400} image={Image25.src} title="Competition" text="Our first competition will be the Brigdestone World Solar Challenge 2025." />
                <GoalCard delay={600} image={ImageNorway.src} title=" Norway" text="Our long term goal is to drive the length of Norway only on solar power." />
            </div>
        </Content>
    )
}