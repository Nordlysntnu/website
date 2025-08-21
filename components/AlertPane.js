import { AnimationOnScroll } from "react-animation-on-scroll";
import Content from "./Content";
import Alert from "./Alert";
import styles from '../styles/AlertPane.module.css';

export default function AlertPane() {
    const alerts = {
        infoMeeting: {
            name: "Info meeting with pizza",
            info: "",
            description: "We have an info meeting with pizza Monday the 25th of August at EL6.",
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
