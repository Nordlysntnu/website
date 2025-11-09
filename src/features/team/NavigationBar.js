import styles from '@shared/styles/SubPart1.module.css';

const teamNames = ["Board", "Mechanical", "Electrical", "Strategy", "Marketing", "Logistics", "Alumni"];

export default function NavigationBar({ selectedTeam, onTeamSelect }) {
    return (
        <div className={styles.horizontalMenu}>
            {teamNames.map((team) => (
                <button
                    key={team}
                    className={`${styles.menuItem} ${selectedTeam === team ? styles.active : ''}`}
                    onClick={() => onTeamSelect(team)}
                >
                    {team}
                </button>
            ))}
        </div>
    );
}