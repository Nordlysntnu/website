import { AnimationOnScroll } from 'react-animation-on-scroll';
import styles from '../styles/PageHeader.module.css';
import Content from './Content';

export default function PageHeader({ title }) {
    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <AnimationOnScroll offset={0} animateIn="animate__fadeIn" animateOnce duration={2}>
                    <svg className={styles.svg} viewBox="0 0 2000 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <text className={`${styles.back} ${styles.text}`} xmlSpace="preserve" textAnchor='middle'><tspan x="995" y="410">{title}</tspan></text>
                        <text className={`${styles.middle} ${styles.text}`} xmlSpace="preserve" textAnchor='middle'><tspan x="1010" y="400">{title}</tspan></text>
                        <text className={`${styles.front} ${styles.text}`} xmlSpace="preserve" textAnchor='middle'><tspan x="1010" y="400">{title}</tspan></text>
                    </svg>
                </AnimationOnScroll>
            </div>
        </div>
    )
}