import Content from "@shared/components/Content";
import styles from './styles/Mission.module.css';
import GoalCard from "@features/home/GoalCard";
import Education from '@assets/symbols-and-logos/Education.png';
import Solar from '@assets/symbols-and-logos/Solar.png';
import Sustainability from '@assets/symbols-and-logos/Sustainability.png';


export default function Mission({ dark, htmlContent }) {
    return (
        <Content dark={dark}>
            <div className={styles.container}>
                <div className={styles.textContainer}>
                    <div className={styles.markdown} dangerouslySetInnerHTML={{__html: htmlContent}} />
                </div>
                <div className={styles.imageContainer}>
                    <GoalCard delay={200} image={Sustainability.src} title="Sustainability" text="Nordlys believes that a sustainable society is a prerequisite for a prosperous future. Our generation's way of life should not come at the cost of future generations’ welfare. We support the UNs sustainable development goals, and directly work towards 8 of them." />
                    <GoalCard delay={400} image={Education.src} title="Teamwork" text="Teamwork is necessary to achieve change and innovation. To work together in a fellowship will provide inspiration, safety and engagement. Nordlys wishes to facilitate multidisciplinary collaboration, comfort in a team-setting and that all team members feel that they are contributing to the project." />
                    <GoalCard delay={600} image={Solar.src} title="Passion" text="Passion signifies that our members are deeply committed to Nordlys’ mission, goals and the tasks they themselves perform. Nordlys’ encourages its members to approach their work with dedication and enthusiasm, and believe that this will be the driving factor in our innovation and problem solving." />
                </div>
            </div>
        </Content>
    )
}