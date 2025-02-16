import { AnimationOnScroll } from "react-animation-on-scroll";
import Content from "./Content";
import Alert from "./Alert";
import styles from '../styles/AlertPane.module.css';

export default function AlertPane() {
    const alerts = {
        infoMeeting: {
            name: "Announcement",
            info: "",
            description: "Nordlys NTNU has decided to withdraw from the Bridgestone World Solar Challenge 2025. It has not been an easy decision, however with the increased shipping-times from Europe to Australia we see that the best approach for the team is to move all our focus towards building a successful car, without cutting corners to meet the shipping deadlines.",
            url: 'https://www.instagram.com/p/DF3Inb1NyqZ/',
            linkText: 'See full announcement'
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