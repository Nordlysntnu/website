import styles from './styles/GoalCardNew.module.css';
import "animate.css/animate.min.css";
import { AnimationOnScroll } from 'react-animation-on-scroll';

export default function GoalCard({ title, text, image, delay }) {
    return (
        <AnimationOnScroll animateIn="animate__fadeInUp" offset={0} animateOnce delay={delay? delay : 0} >
            <div className={styles.container}>
                <div className={styles.imageContainer}>
                    <img className={styles.image} src={image} />
                </div>
                <div className={styles.textContainer}>
                    <h4 className={styles.title}>{title}</h4>
                    <p className={styles.text}>{text}</p>
                </div>
            </div>
        </AnimationOnScroll>
    )
}