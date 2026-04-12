import Content from "@shared/components/Content";
import styles from './styles/Mission.module.css';

export default function Competitions({ dark, htmlContent }) {
    return (
        <Content dark={dark}>
            <div className={styles.container}>
                <div className={styles.textContainer}>
                    <div className={styles.markdown} dangerouslySetInnerHTML={{__html: htmlContent}} />
                </div>
            </div>
        </Content>
    )
}