import JoinForm from './JoinForm';
import styles from './styles/ApplySection.module.css';

export default function ApplySection({ groups, choices, onToggle, onReset }) {
    return (
        <div id="apply" className={styles.container}>
            <div className={styles.info}>
                <p className={styles.eyebrow}>Apply</p>
                <h2 className={styles.title}>Send your application</h2>
                <p className={styles.text}>
                    It only takes a few minutes. Apply as a member of one or more groups; you do not need to choose a
                    specialist position. Tell us what interests you and what you would like to learn.
                </p>
                <div className={styles.note}>
                    <h3 className={styles.noteTitle}>Thesis with Nordlys</h3>
                    <p>
                        Thinking about a bachelor&apos;s or master&apos;s thesis with us? Tick the box in the form and
                        describe your idea. You must also apply for your thesis through NTNU.
                    </p>
                </div>
                <div className={styles.note}>
                    <h3 className={styles.noteTitle}>Your data</h3>
                    <p>
                        Only the Nordlys Board can see your application. We keep it until it has been processed, and
                        no longer than six months.
                    </p>
                </div>
            </div>
            <JoinForm groups={groups} choices={choices} onToggle={onToggle} onReset={onReset} />
        </div>
    );
}
