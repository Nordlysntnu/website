import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TeamGroup from "./TeamGroup";
import { members } from "./data/members";
import { teamStructure } from "./TeamStructure";
import YearSelector from "./yearSelector";
import GroupMenu from "./GroupMenu";
import styles from "./styles/TeamOverview.module.css";
import SubPart1 from '@shared/components/SubPart1';

export const getMembersForYear = (members, year) =>
  members.filter(member =>
    Array.isArray(member.history) &&
    member.history.some(h => h.year === Number(year))
  );

export const getMembersForGroup = (members, year, group) =>
  members.filter(member =>
    Array.isArray(member.history) &&
    member.history.some(
      h =>
        h.year === year &&
        h.group.includes(group)
    )
  );

const TeamOverview = (descriptions) => {
  const router = useRouter();

  const availableYears = Object.keys(teamStructure)
    .map(Number)
    .sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState(availableYears[0]);
  const [selectedGroup, setSelectedGroup] = useState("all");

  // Sync state FROM URL
  useEffect(() => {
    const { year, group } = router.query;

    if (year && teamStructure[year]) {
      setSelectedYear(Number(year));
    }

    if (group) {
      setSelectedGroup(group);
    }
  }, [router.query]);

  // Push state TO URL (no scroll jump)
  const updateURL = (year, group) => {
    router.push(
      {
        pathname: router.pathname,
        query: { year, group },
      },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    setSelectedGroup("all");
    updateURL(newYear, "all");
  };

  const handleGroupChange = group => {
    setSelectedGroup(group);
    updateURL(selectedYear, group);
  };

  const yearMembers = getMembersForYear(members, selectedYear);
  const currentIndex = availableYears.indexOf(selectedYear);
  const prevYear = availableYears[currentIndex + 1];
  const nextYear = availableYears[currentIndex - 1];

  const currentDescription = selectedGroup !== "all" ? descriptions?.[selectedGroup] || "" : null;


  return (
    <div className={styles.container}>

      <div className={styles.yearHeader}>
        {prevYear && <button onClick={() => handleYearChange(prevYear)}>← {prevYear}</button>}
        <h1>{teamStructure[selectedYear].label}</h1>
        {nextYear && <button onClick={() => handleYearChange(nextYear)}>{nextYear} →</button>}
      </div>

      <ul className={styles.GroupMenu}>
        <li className={selectedGroup === "all" ? styles.active: ""} onClick={() => handleGroupChange("all")}>
          All members
        </li>
        {teamStructure[selectedYear].groups.map((group) => (
          <li key={group} className={selectedGroup === group ? styles.active : ""} onClick={() => handleGroupChange(group)}>
            {group}
          </li>
        ))}
      </ul>

      {selectedGroup === "all" ? (
        teamStructure[selectedYear].groups.map((group) => {
          const groupMembers = getMembersForGroup(members, selectedYear, group);
          if (!groupMembers.length) return null;

          return (
            <section key={group} className={styles.groupSection}>
              <h2 className={styles.groupHeading}>{group}</h2>
              <TeamGroup year={selectedYear} members={groupMembers} />
            </section>
          )
        })
      ) : (
        <>
        <h2 className={styles.groupHeading}>{selectedGroup}</h2>
        <TeamGroup year={selectedYear} members={getMembersForGroup(members, selectedYear, selectedGroup)}/>

        {selectedGroup !== "all" && descriptions[selectedGroup] && (
          <SubPart1
          dark={true}
          image={`/images/compressed/${selectedGroup}team.jpg`}
          title={selectedGroup}
          text={descriptions[selectedGroup]}
          link=""
          linkText=""
          />
        )}
        </>
      )}
      </div>
  );
}

export default TeamOverview;
