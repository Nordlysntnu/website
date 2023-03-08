import Content from "./Content";
import GoalCardOl from "./GoalCardOl";
import styles from '../styles/Goals.module.css';
import TeamImage from '../public/TeamImage.png';
import RaceImage from '../public/RaceImage.png';
import NorwayImage from '../public/NorwayImage.png';
import PartHeader from "./PartHeader";

export default function Goals({ dark }) {
    return (
        <Content dark={dark}>
            <div className={styles.container}>
                <PartHeader darkColor={true} title="Our Goals" text="To succeed in our attempts in competition, our strive to develop world leading engineers and promote sustainable technologies, we have formulated a set of goals." />
                <div className={styles.goalContainer}>
                    <GoalCardOl image={TeamImage.src} title={"Create the team"} text={"The first step towards building a car, is having a strong team of students. The first members have already begun the work on our first car, but we aim at putting together our first bigger team by August 2023."} />
                    <GoalCardOl image={RaceImage.src} title={"Compete in 2025"} text={"Designing, developing and building a competitive car takes time. Cutting corners can also put both members and others in danger. However, we want to strive towards competing already in 2025, as long as this can be done safely."} />
                    <GoalCardOl image={NorwayImage.src} title={"Drive the length of Norway"} text={"If you can drive a solar car through the harsh and steep terrain of Norway, you can drive anywhere. We want to show the strength of solar power by driving our car the entire length of Norway, using only solar energy."} />
                </div>
            </div>
        </Content>
    )
}