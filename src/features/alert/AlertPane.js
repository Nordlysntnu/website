import { AnimationOnScroll } from "react-animation-on-scroll";
import { useState, useEffect } from "react";
import Content from "@shared/components/Content";
import Alert from "./Alert";
import styles from './styles/AlertPane.module.css';

export default function AlertPane() {
    const alerts = {
        infoMeeting: {
            name: "Application deadline 27. August",
            info: "",
            description: "Apply now!",
            link: 'join',
            linkText: ''
        },
        recruitment: {
            name: "Recruitment period ended",
            info: "Ended 18.01",
            description: "The next recruitment period will be 16.02 to 01.03 and will be for Board positions. You’re still welcome to submit an open application in the meantime. We’d love to hear from you!",
            link: "#applicationForm",
            linkText: "Apply below"
        }
    }

    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const dismissed = localStorage.getItem("joinAlertDismissed");
        if(dismissed) setVisible(false);
    }, []);

    const closeAlert = () => {
        localStorage.setItem("joinAlertDismissed", "true");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <Content dark={true}>
            <AnimationOnScroll animateIn="animate__fadeInUp" animateOnce>
                <div className={styles.container}>
                    <Alert alert={alerts.recruitment} onClose={closeAlert} />
                </div>
            </AnimationOnScroll>
        </Content>
    );
}
