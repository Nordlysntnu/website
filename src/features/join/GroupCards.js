import ThemedIcon from '@features/ui/ThemedIcon';
import { MAX_CHOICES, ordinal, roleOf } from './choices';
import styles from './styles/GroupCards.module.css';

export default function GroupCards({ groups, choices, onToggle }) {
    const full = choices.length >= MAX_CHOICES;

    return (
        <div id="groups" className={styles.container}>
            <div className={styles.header}>
                <p className={styles.eyebrow}>Our groups</p>
                <h2 className={styles.title}>Find your place</h2>
                <p className={styles.lead}>
                    Every group takes in new members. Choose up to {MAX_CHOICES} groups, in order of preference,
                    and they are added to your application below.
                </p>
            </div>
            <ul className={styles.grid}>
                {Object.entries(groups).map(([key, group]) => {
                    const rank = choices.indexOf(key);
                    const chosen = rank >= 0;
                    const role = roleOf(group);
                    return (
                        <li key={key} className={`${styles.card} ${chosen ? styles.chosen : ''}`}>
                            <div className={styles.cardHeader}>
                                <ThemedIcon className={styles.icon} width={44} height={44} light={group.image?.light ?? group.image} dark={group.image?.dark} />
                                <h3 className={styles.name}>{group.name}</h3>
                            </div>
                            <div className={styles.description} dangerouslySetInnerHTML={{ __html: group.description }} />
                            {role && (
                                <div className={styles.role}>
                                    <p className={styles.roleName}>{role.name}</p>
                                    <div dangerouslySetInnerHTML={{ __html: role.text }} />
                                </div>
                            )}
                            <button
                                type="button"
                                className={styles.choose}
                                aria-pressed={chosen}
                                disabled={!chosen && full}
                                onClick={() => onToggle(key)}
                            >
                                {chosen ? <>&#10003; {ordinal(rank)} choice<span className={styles.remove}>Remove</span></> : <>Choose<span className={styles.srOnly}> {group.name}</span></>}
                            </button>
                        </li>
                    );
                })}
            </ul>
            <p className={styles.status} aria-live="polite">
                {full ? `You have chosen ${MAX_CHOICES} groups. Remove one to choose another.` : ''}
            </p>
        </div>
    );
}
