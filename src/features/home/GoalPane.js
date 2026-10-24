import Content from '@shared/components/Content';
import Image from 'next/image';
import Image25 from '@assets/symbols-and-logos/2025Goal.png';
import ImageTeam from '@assets/symbols-and-logos/TeamGoal.png';
import ImageNorway from '@assets/symbols-and-logos/NorwayGoal.png';
import styles from './styles/GoalPane.module.css';

const goals = [
    { image: ImageTeam, title: 'Ambition', text: 'We aim to become the best solar racing team in the world.' },
    { image: Image25, title: 'Project', text: 'Our first car was built in 2025.' },
    { image: ImageNorway, title: 'Norway', text: 'Our long term goal is to drive the length of Norway only on solar power.' },
];

export default function GoalPane() {
    return (
        <Content>
            <section className={styles.container} aria-label="Our goals">
                {goals.map(({ image, title, text }) => (
                    <article className={styles.goal} key={title}>
                        <Image src={image} alt="" width={72} height={72} className={styles.image} sizes="72px" />
                        <div>
                            <h2 className={styles.title}>{title}</h2>
                            <p className={styles.text}>{text}</p>
                        </div>
                    </article>
                ))}
            </section>
        </Content>
    );
}
