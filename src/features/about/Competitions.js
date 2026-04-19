import Content from "@shared/components/Content";
import styles from './styles/Competitions.module.css';

export default function Competitions({ dark, introHtml, competitions }) {
    return (
        <Content dark={dark}>
            <div className={styles.container}>
                <div className={styles.intro} dangerouslySetInnerHTML={{ __html: introHtml }} />

                {competitions.map((comp, index) => (
                    <div key={index} className={styles.row}>
                        <div className={styles.text}>
                            <p>
                            <strong>{comp.title}</strong>
                            </p>
                            <div dangerouslySetInnerHTML={{ __html: comp.bodyHtml }} />
                        </div>
                        
                        {comp.image && (
                            <div className={styles.imageContainer}>
                                <img src={comp.image} alt={comp.title} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Content>
    );
}