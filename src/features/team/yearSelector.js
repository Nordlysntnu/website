import styles from "./styles/TeamOverview.module.css";

//Temporary file

export default function YearSelector({ years, selectedYear, onSelect }) {
  return (
    <ul className={styles.yearMenu}>
      {years.map(year => (
        <li
          key={year}
          className={selectedYear === year ? styles.active : ""}
          onClick={() => onSelect(year)}
        >
          Team {year}
        </li>
      ))}
    </ul>
  );
}