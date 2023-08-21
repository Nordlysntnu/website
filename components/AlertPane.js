import { AnimationOnScroll } from "react-animation-on-scroll";
import Content from "./Content";
import Alert from "./Alert";
import styles from '../styles/AlertPane.module.css';

export default function AlertPane() {
    const alerts = {
        infoMeeting: {
            name: "Info Meeting 2023",
            info: "28. Aug | S1, Gløs | 17:15",
            description: "Learn more about the project, Solar Racing and what positions you can apply for in Nordlys. There will be pizza, popcorn and soda, and we will be showing the documentary series Light Speed from 2019.",
            url: 'https://fb.me/e/2LpjqhSdJ',
            linkText: 'See event'
        }
    }
    return (
        <Content dark={false}>
            <AnimationOnScroll animateIn="animate__fadeInUp" animateOnce>
                <div className={styles.container}>
                    <Alert alert={alerts.infoMeeting}></Alert>
                </div>
            </AnimationOnScroll>
        </Content>
    )
}