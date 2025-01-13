import { AnimationOnScroll } from "react-animation-on-scroll";
import Content from "./Content";
import Alert from "./Alert";
import styles from '../styles/AlertPane.module.css';

export default function AlertPane() {
    const alerts = {
        infoMeeting: {
            name: "Spring Recruitment",
            info: "Deadline January 24th 23:59",
            description: "Join us building Norway's first ever solar racing car this semester! We have available positions in the Mechnical group, Strategy group and Brand group.",
            url: '/join',
            linkText: 'Apply'
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