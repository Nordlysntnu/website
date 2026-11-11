import styles from './styles/JoinIntro.module.css';

const steps = [
    ['Find your group', 'Read about our eight groups and choose up to three.'],
    ['Tell us about yourself', 'Your studies, your interests and what you would like to learn.'],
    ['We get in touch', 'We contact you by email with more information.'],
];

export default function JoinIntro() {
    return (
        <div className={styles.container}>
            <div className={styles.text}>
                <p className={styles.eyebrow}>Join Nordlys</p>
                <h2 className={styles.title}>Help build Norway&apos;s solar race cars</h2>
                <p className={styles.lead}>
                    We welcome students from every study programme and year. Whether you want to design electronics,
                    shape the car&apos;s body, find partners or tell our story, there is a place for you in Nordlys.
                </p>
                <div className={styles.actions}>
                    <a className={styles.primary} href="#apply">Apply now</a>
                    <a className={styles.secondary} href="#groups">Explore the groups</a>
                </div>
            </div>
            <ol className={styles.steps}>
                {steps.map(([title, text], index) => (
                    <li key={title} className={styles.step}>
                        <span className={styles.number} aria-hidden="true">{index + 1}</span>
                        <div>
                            <h3 className={styles.stepTitle}>{title}</h3>
                            <p className={styles.stepText}>{text}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}
