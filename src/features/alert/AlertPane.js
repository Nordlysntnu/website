import { AnimationOnScroll } from "react-animation-on-scroll";
import Content from "./Content";
import Alert from "../Alert";
import styles from '../styles/AlertPane.module.css';

export default function AlertPane() {
    const alerts = {
        infoMeeting: {
            name: "Application deadline 27. August",
            info: "",
            description: "Apply now!",
            link: 'join',
            linkText: ''
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
