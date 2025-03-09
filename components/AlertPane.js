import { AnimationOnScroll } from "react-animation-on-scroll";
import Content from "./Content";
import Alert from "./Alert";
import styles from '../styles/AlertPane.module.css';

export default function AlertPane() {
    const alerts = {
        infoMeeting: {
            name: "Leadership recruitment",
            info: "Deadline: March 14th 2025",
            description: "We are currently recruiting group leaders and board members for the 2025/2026 project.",
            link: 'join',
            linkText: 'Apply here'
        }
    }

    if (alerts) {
        return (
            <Content dark={false}>
                <AnimationOnScroll animateIn="animate__fadeInUp" animateOnce>
                    <div className={styles.container}>
                        <Alert alert={alerts.infoMeeting}></Alert>
                    </div>
                </AnimationOnScroll>
            </Content>
        )
    } else return (<></>)
}