import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TeamGroup from "./TeamGroup";
import { members } from "./data/members";
import { teamStructure } from "./TeamStructure";
import YearSelector from "./yearSelector";
import GroupMenu from "./GroupMenu";
import styles from "./styles/TeamOverview.module.css";
import SubPart1 from '@shared/components/SubPart1';

//TODO: re-add mobile view

const groupDescriptions = {
  'Board': (
    <p>
      <b>The Board</b> of Nordlys is the deciding and guiding force of our organization, consisting of group leaders and exceptional students. Every major decision goes either thru, or is made by the board, which makes its members exposed to great responsibility. With this responsibility also comes power, which the board members are expected to handle with care and respect. The board is the very pilar of which the other groups stand, and what nurtures their ability to grow and preform.
    </p>
  ),
  'Electrical': (
    <p>
      <b>The Electrical group</b> is responsible for every electrical component of the car. They design, implement, and monitor complex electrical systems to ensure optimal energy efficiency and reliability. As a top two group size-wise within Nordlys, the electrical group is a major part of the organization. Preforming electrical components is vital in a good solar car, which causes the members focus in details to be unprecedented. The electrical group is fundamentally important in our chase to become world-leading in our field.
    </p>
  ),
  'Mechanical': (
    <p>
      <b>The Mechanical group</b> is responsible for every non-electrical, physical component in the car. From suspension to roll cage, the mechanical group does it all. The significant drive to make the cars lighter and sturdier than ever before, pushes the mechanical group to the edge as they balance reliability, sturdiness, weight and performance. As a top two group size-wise within Nordlys, the mechanical group is undeniably vital in the ultimate performance of our car.
    </p>
  ),
  'Software': (
    <p>
      <b>The Software group</b> is responsible for analyzing data and developing race plant to maximise the car’s performance during competition. The group uses insight in weather patterns, energy consumption, and road conditions to create plans for the most efficient way to complete a competition. The Software group is also responsible for Nordlys’ servers and website.
    </p>
  ),
  'Marketing': (
    <p>
      <b>The Marketing group</b> shapes the public image of Nordlys, aiming to build awareness and excitement in our team’s mission. Through social media, stands, financial connections and web solutions the brand group works towards gaining sponsorships, recruiting talent and improving the overall brand of Nordlys. As in-house talent and sponsorships are vital for our organization’s survival, the brand makes up an important supporting pilar in our organization.
    </p>
  ),
  'Logistics': (
    <p>
      <b>The Logistics group</b> is responsible for all transportation and logistics related to the competition in a cost-effective manner. This includes everything from transportation planning, customs clearance, documentation, equipment handling, supply chain logistics, and compliance with various regulations that must be followed. The team also ensures that every piece of equipment, from the solar car itself to the smallest tools, arrives on time and in perfect condition. They manage both international and domestic logistics, coordinating with shipping companies, airlines, and local service providers to streamline the process. The group is essential in allowing the rest of the team to focus solely on the competition without having to worry about the practicalities of transport and logistics. Their work guarantees that all resources are in the right place at the right time, enabling the team to perform at their best.
    </p>
  ),
  //'Technical advisor': <p></p>,
  /*'Alumni': (
    <p>
      <b>The Alumni</b> consists of former Nordlys members. We are proud to present our former members who all contributed to shaping Nordlys into the organization it is today.
    </p>
  )*/
  //'All active members': <p> </p>
};


export const getMembersForYear = (members, year) =>
  members.filter(member =>
    Array.isArray(member.history) &&
    member.history.some(h => h.year === Number(year))
);

export const getMembersForGroup = (members, year, group) =>
  members.filter(member =>
    Array.isArray(member.history) &&
    member.history.some(h =>
        h.year === year && h.group.includes(group)
    )
);

const TeamOverview = (descriptions) => {
  const router = useRouter();
  const availableYears = Object.keys(teamStructure).map(Number).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState(availableYears[0]);
  const [selectedGroup, setSelectedGroup] = useState("all");

  useEffect(() => {
    const { year, group } = router.query;

    if (year && teamStructure[year]) {
      setSelectedYear(Number(year));
    }

    if (group) {
      setSelectedGroup(group);
    }
  }, [router.query]);

  const updateURL = (year, group) => {
    router.push({ pathname: router.pathname, query: { year, group }}, undefined, { shallow: true, scroll: false });
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
              <h2 className={styles.groupTitle}>{group}</h2>
              <TeamGroup year={selectedYear} members={groupMembers} />
            </section>
          )
        })
      ) : (
        <>
        <h2 className={styles.groupTitle}>{selectedGroup}</h2>
        <TeamGroup year={selectedYear} members={getMembersForGroup(members, selectedYear, selectedGroup)}/>

        //TODO: fix SubPart1 not rendering

        
        </>
      )}
      
      {/* Information section */}
            {groupDescriptions[selectedGroup] && (
                <SubPart1 
                dark={true} 
                image={`/images/compressed/${selectedGroup}team.jpg`} 
                title={selectedGroup} 
                text={groupDescriptions[selectedGroup]} 
                link="" 
                linkText="" 
              />
            )}
      </div>
  );
}

export default TeamOverview;
