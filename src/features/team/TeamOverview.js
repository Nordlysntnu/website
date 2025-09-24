
import React, { useState, useEffect } from 'react';
import TeamGroup from './TeamGroup';
import { members } from './data/members';
import styles from './styles/TeamOverview.module.css';
import SubPart1 from '@shared/components/SubPart1';
import { useRouter } from 'next/router';

const teamGroups = [
  'Board',
  'Electrical',
  'Mechanical',
  'Chassis',
  'Software',
  'Brand',
  'Logistics',
  'Technical advisor',
  'Alumni',
  'All active members'
];
      //<b>The Strategy group</b> is responsible for analyzing data and developing race plans to maximize the car’s performance during competitions. The group uses insight in weather patterns, energy consumption, and road conditions to create plans for the most efficient way to complete a competition. Without good race plans and strategies, even the best of solar cars will be left behind, which makes the strategy group vital for Nordlys’ chase to become world leading.

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
  'Brand': (
    <p>
      <b>The Brand group</b> shapes the public image of Nordlys, aiming to build awareness and excitement in our team’s mission. Thru social media, stands, financial connections and web solutions the brand group works towards gaining sponsorships, recruiting talent and improving the overall brand of Nordlys. As in-house talent and sponsorships are vital for our organization’s survival, the brand makes up an important supporting pilar in our organization.
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
    const [selectedGroup, setSelectedGroup] = useState('Board');
    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter(); // Bruker useRouter for å få tilgang til URL-query
    const { group } = router.query; // Hent query-parameteren 'group'
    // Når 'group' i URL-en endres, oppdater valgt gruppe
    useEffect(() => {
      if (group && teamGroups.includes(group.charAt(0).toUpperCase() + group.slice(1))) {
          setSelectedGroup(group.charAt(0).toUpperCase() + group.slice(1)); // Oppdater valgt gruppe med riktig format
      }
  }, [group]); // Når 'group' endres i URL-en, oppdater 'selectedGroup'
  const handleGroupChange = (group) => {
      setSelectedGroup(group);
      router.push(`/team?group=${group.toLowerCase()}`); // Oppdater URL-parameteren
      setMenuOpen(false); // Lukk dropdown når et valg er gjort
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
            {/* Navigation bar */}
            <nav className={styles.navbar}>
                <div className={styles.mobileToggle} onClick={() => setMenuOpen(!menuOpen)}>
                    {isMobile && (
                        <span>
                            {selectedGroup}
                            <span className={styles.arrow} style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease-in-out' }}>
                            ▼
                              </span> {/* ▼ ⌄ 𐣼 */}
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
            {/* Group name as title */}
            <h2 className={styles.groupTitle}>{selectedGroup}</h2>

            {/* Display group members */}
	    {!["Alumni", "Technical advisor"].includes(selectedGroup) ? 
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
	
	    {!["Chassis", "Alumni", "Technical advisor"].includes(selectedGroup) ? <div>
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

            {/* Information section */}
            {groupDescriptions[selectedGroup] && (
                <SubPart1 
                dark={true} 
                image={`/images/${selectedGroup}team.png`} 
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

