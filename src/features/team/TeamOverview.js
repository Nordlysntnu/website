
import React, { useState, useEffect } from 'react';
import TeamGroup from './TeamGroup';
import { members } from './data/members';
import { teamStructure } from './TeamStructure';
import styles from './styles/TeamOverview.module.css';
import SubPart1 from '@shared/components/SubPart1';
import { useRouter } from 'next/router';
import { type } from 'os';

const teamGroups = [
  'All members',
  'Board',
  'Electrical',
  'Mechanical',
  'Chassis',
  'Software',
  'Marketing',
  'Logistics',
  'Technical advisor',
  'Alumni',
];
      //<b>The Strategy group</b> is responsible for analyzing data and developing race plans to maximize the car’s performance during competitions. The group uses insight in weather patterns, energy consumption, and road conditions to create plans for the most efficient way to complete a competition. Without good race plans and strategies, even the best of solar cars will be left behind, which makes the strategy group vital for Nordlys’ chase to become world leading.

const years =[2026, 2025];

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

const TeamOverview = () => {
    const router = useRouter(); // Bruker useRouter for å få tilgang til URL-query
    const { group } = router.query;

    const [selectedYear, setSelectedYear] = useState(years[0]);
    const [selectedGroup, setSelectedGroup] = useState("All members");

    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const currentYearIndex = years.indexOf(selectedYear);

    const goToPrevYear = () => {
      if (currentYearIndex < years.length - 1) {
        setSelectedYear(years[currentYearIndex + 1]);
      }
    };

    const goToNextYear = () => {
      if (currentYearIndex > 0) {
        setSelectedYear(years[currentYearIndex - 1]);
      }
    };

    const groupsToShow = teamGroups.filter(
      g => !["All members", "Alumni", "Technical advisor"].includes(g)
    );

    const getMembersByGroupAndYear = (group, year) => {
      return members.filter(member => 
        Array.isArray(member.history) &&
        member.history.some(
          h => h.year === year && h.group.includes(group)
        )
      );
    };

    useEffect(() => {
      if (group && teamGroups.includes(group.charAt(0).toUpperCase() + group.slice(1))) {
        setSelectedGroup(group.charAt(0).toUpperCase() + group.slice(1));
      }
    }, [group]);

    const handleGroupChange = (group) => {
      setSelectedGroup(group);
      router.push({ pathname: router.pathname, query: { ...router.query, group: group.toLowerCase() }}, undefined, { shallow: true, scroll: false });
      setMenuOpen(false);
    };

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= 1050);
      if (typeof window !== 'undefined') {
        handleResize();
        window.addEventListener('resize', handleResize);
      }

      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', handleResize);
        }
      };
    }, []);

    return (
      <div className={styles.container}>
        <nav className={styles.navbar}>
          <div className={styles.mobileToggle} onClick={() => setMenuOpen(!menuOpen)}>
            {isMobile && (
              <span>
                {selectedGroup}
                <span className={styles.arrow} styke={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease-in-out' }}>
                  ▼
                </span>
              </span>
            )}
          </div>
          {isMobile ? (
            menuOpen && (
              <ul className={styles.mobileNav}>
                {teamGroups.map(group => (
                  <li key={group} onClick={() => handleGroupChange(group)} className={selectedGroup === group ? styles.active : ''}>
                    {group}
                  </li>
                ))}
              </ul>
            )
          ) : (
            <ul className={styles.navList}>
              {teamGroups.map(group => (
                <li key={group} onClick={() => handleGroupChange(group)} className={selectedGroup === group ? styles.active : ''}>
                  {group}
                  </li>
              ))}
            </ul>
          )}
        </nav>

        <div className={styles.headerSection}>

          {selectedGroup !== "All members" && (
            <h2 className={styles.groupTitle}>{selectedGroup}</h2>

          )}

        {selectedGroup === "All members" && (
          <div className={styles.yearNav}>
            <button onClick={goToPrevYear} disabled={currentYearIndex === years.length - 1}>
              ◀
            </button>

            <h3 className={styles.yearTitle}>Project {selectedYear}</h3>

            <button onClick={goToNextYear} disabled={currentYearIndex === 0}>
              ▶
            </button>
          </div>
        )}

        {selectedGroup === "All members" && (
          <div>
            {groupsToShow.map(group => {
              const groupMembers = getMembersByGroupAndYear(group, selectedYear);
              if (groupMembers.length === 0) return null;

              return (
                <div key={group}>
                  <h3 className={styles.groupTitle}>{group}</h3>
                  <TeamGroup year={selectedYear} members={groupMembers}/>
                  </div>
              );
            })}
            </div>
        )}

        {!["Alumni", "All members", "Technical advisor"].includes(selectedGroup) ? 
	    	<div><h3 className={styles.groupTitle}>Project 2026</h3>
            	<TeamGroup 
	    	    year={2026} 
	    	    members={members.filter(member => 
	    	    	Array.isArray(member.history) &&
	    	    	member.history.some(
	    	    		h => h.year == 2026 && h.group.includes(selectedGroup)
	    	    	)
	    	)}/></div>
	    : null}

      {!["Chassis", "All members", "Alumni", "Technical advisor"].includes(selectedGroup) ? <div>
	    	<h3 className={styles.groupTitle}>Project 2025</h3>
            	<TeamGroup 
	    	    year={2025} 
	    	    members={members.filter(member => 
	    	    	Array.isArray(member.history) &&
	    	    	member.history.some(
	    	    		h => h.year == 2025 && h.group.includes(selectedGroup)
	    	    	)
	    	)}/></div>
	   : null}

     {["Alumni", "Technical advisor"].includes(selectedGroup) ? <div>
            	<TeamGroup 
	    	    year={2025} 
	    	    members={members.filter(member => 
	    	    	Array.isArray(member.history) &&
	    	    	member.history.some(
	    	    		h => h.year == 2025 && h.group.includes(selectedGroup)
	    	    	)
	    	)}/></div>
	    : null}	

        </div>

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
  };

  export default TeamOverview;
