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
                    <h1 className={styles.title}>The Mission</h1>
                    <p className={styles.text}>Theres nothing more valuable than creating something new. <em>Nordlys NTNU</em> is a student technical organisation at the Norwegian University of Science and Technology, aiming to <em>drive across Norway</em> completely on Solar energy. Through the project, we wish to set focus on <em>solutions to sustainability</em>, showcase the <em>growing Norwegian solar industry</em>, and give members the <em>greatest possible education</em> required to tackle the problems of the future.</p>
                </div>
                <div className={styles.imageContainer}>
                    <GoalCard delay={200} image={Sustainability.src} text="Sustainable solutions" />
                    <GoalCard delay={400} image={Solar.src} text="Solar industry" />
                    <GoalCard delay={600} image={Education.src} text="Quality education" />
                </div>
            </div>
        </Content>
    )
}