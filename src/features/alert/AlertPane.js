import { motion, AnimatePresence } from "framer-motion";
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
            info: "Updated 08.02",
            description: "The next recruitment period will be 16.02 to 01.03 and will be for Board positions. You’re still welcome to submit an open application in the meantime!",
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

    return (
        <Content dark={true} nopad={true}>
            <AnimatePresence>
                         {visible && (
                         <motion.div key="recruitment-alert" className={styles.container} initial={{ opacity: 0, y: 20, height: "auto", marginTop: "1rem" }} animate={{ opacity: 1, y: 0, height: "auto", marginTop: "1rem" }} exit={{ opacity: 0, y: -20, height: 0, marginTop: 0 }} transition={{ duration: 0.5 }}>
                              <Alert alert={alerts.recruitment} onClose={closeAlert} />
                         </motion.div>
                         )}
                    
            </AnimatePresence>
       </Content>
    );
}
