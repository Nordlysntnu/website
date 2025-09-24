import Content from "@shared/components/Content";
import styles from './styles/Mission.module.css';
import GoalCard from "@features/home/GoalCard";
import Education from '@assets/symbols-and-logos/Education.png';
import Solar from '@assets/symbols-and-logos/Solar.png';
import Sustainability from '@assets/symbols-and-logos/Sustainability.png';
import Link from "next/link";




export default function Mission({ dark }) {
    return (
        <Content dark={dark}>
            <div className={styles.container}>
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>Who we are</h1>
                    <p className={styles.text}><b>Nordlys NTNU</b> is a brand-new group of students at the Norwegian University of Science and Technology (NTNU) with the goal of participating and excelling in the world of Solar Racing. Solar Racing involves covering long distances as quickly as possible using only solar energy. In the world championship, the Bridgestone World Solar Challenge, student teams from around the world traverse the 3000 kilometers from Darwin to Adelaide in the Australian Outback with an average speed of 90 km/h! To this day, no Norwegian teams have attempted this.</p> 
                    <br />
                    <p className={styles.text}>We aim to compete in Australia as early as 2027, with the ambitious goal of reaching the top ten teams. Our long-term goal is to become one of the top performing teams in the world, with our ultimate objective of showing Norway the possibilities of clean and renewable energy. When we have proven ourselves on the international arena, we aim to bring Solar Racing itself to Norway by driving the length of Norway using pure solar energy.</p>
                    <br />
                    <p>To read more about the <em>team</em> and it's respective groups <Link href="/team"className={styles.link}>click here</Link></p>
                    <br />
                    <br />
                    <h1 className={styles.title}>Our values</h1>
                    <p className={styles.text}>Theres nothing more valuable than creating something new. Through the project, we wish to set focus on <em>solutions to sustainability</em>, facilitate for multidisciplinary <em>teamwork</em>, and drive a <em>passion</em> for innovation and technology through enthusiasm and dedication.</p>
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