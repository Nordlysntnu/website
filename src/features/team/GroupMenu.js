import styles from "./styles/TeamOverview.module.css";

export default function GroupMenu({ groups, selectedGroup, onSelect }) {
  return (
    <ul className={styles.groupMenu}>
      <li
        className={selectedGroup === "all" ? styles.active : ""}
        onClick={() => onSelect("all")}
      >
        All Members
      </li>

      {groups.map(group => (
        <li
          key={group}
          className={selectedGroup === group ? styles.active : ""}
          onClick={() => onSelect(group)}
        >
          {group}
        </li>
      ))}
    </ul>
  );
}