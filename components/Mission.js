import Content from "./Content";
import styles from '../styles/Mission.module.css';
import GoalCard from "./GoalCard";
import Education from '../public/Education.png';
import Solar from '../public/Solar.png';
import Sustainability from '../public/Sustainability.png';




export default function Mission({ dark }) {
    return (
        <Content dark={dark}>
            <div className={styles.container}>
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>What we do</h1>
                    <p className={styles.text}><b>Nordlys NTNU</b> is Norway`s first ever solar racing team. We are a student technical organisation at the Norwegian University of Science and Technology, aiming, in the long term, to drive across Norway exclusively fueled by solar energy. We are currently in the development process, aiming to complete our first race; the <em>Brigdestone World Solar Challenge</em> in Australia summer of 2025. 47 students, through our six different groups; <em>electrical, strategy, logistics, mechanical, brand</em> and <em>board</em>, are working closely together to create the perfect environment for growth. Both as a team and as individuals.</p>
                    <p>To read more about the <em>team</em> and their respective groups <a href="https://www.nordlysntnu.no/team.html" style={{ color: 'red' }}><em><u>click here</u></em></a>.</p>
                    <br />
                    <p className={styles.text}><b>The car</b> will be running exclusively on solar energy. The highly technological solar panels inbeded in the chassis catches sunrays, coverts them to electrical energy, before it's fed directly into the electrical engine, using possibly gamechanging technology.</p>
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