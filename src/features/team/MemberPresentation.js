import Content from '@shared/components/Content';
import styles from './styles/MemberPresentation.module.css';
import Hans from '../../../public/members/HansDreyerHysing.jpg';
import Wilhelm from '../../../public/members/WilhelmBorgersen.jpg';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import Image from 'next/image'
import Link from 'next/link';

export default function MemberPresentation({ dark }) {
    return (
        <Content dark={dark}>
            <div className={styles.container}>
                <div className={styles.imageOuterContainer}>
                    <div className={styles.imageContainer}>
                        <AnimationOnScroll animateIn='animate__fadeIn' delay={0} animateOnce>
                            <Image width={250} height={250} className={styles.image} src={Hans.src} />
                        </AnimationOnScroll>
                    </div>
                    <div className={styles.imageContainer}>
                        <AnimationOnScroll animateIn='animate__fadeIn' delay={200} animateOnce>
                            <Image width={250} height={250} className={styles.image} src={Wilhelm.src} />
                        </AnimationOnScroll>
                    </div>
                </div>
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>Hans and Wilhelm</h1>
                    <div className={styles.text}>This past year we have already begun laying the groundworks for Nordlys. Two students of power electronics has written their project and master's theses on the car. Hans has been looking into the choice of motor for the car, a motor system that needs to be both lightweight, fast and energy efficient. Wilhelm has developed a model of the electrical system of the car, simulating the car's expected speed. Now it's time to really delve into the project and the development of the car. Are you with us?</div>
                <Link href="/join" className={styles.button}>Join</Link>
                </div>
            </div>
        </Content>
    )
}