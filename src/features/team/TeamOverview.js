
import React, { useState, useEffect } from 'react';
import TeamGroup from './TeamGroup';
import project2025 from './data/project2025.json';
import project2026 from './data/project2026.json';
import project2027 from './data/project2027.json';
import styles from './styles/TeamOverview.module.css';
import SubPart1 from '@shared/components/SubPart1';
import { useRouter } from 'next/router';

const projects = {
  2025: project2025,
  2026: project2026,
  2027: project2027,
};

const TeamOverview = () => {
    const router = useRouter(); // Use useRouter to get access to the URL-query
    const { group } = router.query; // Retrieve the query-parameter 'group'

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

    // When 'group' in the URL changes, update selected group
    useEffect(() => {
      if (group && teamGroups.includes(group.charAt(0).toUpperCase() + group.slice(1))) {
        setSelectedGroup(group.charAt(0).toUpperCase() + group.slice(1));
      }
    }, [group]); 

    const handleGroupChange = (group) => {
      setSelectedGroup(group);
      router.push({ pathname: router.pathname, query: { ...router.query, group: group.toLowerCase() }}, undefined, { shallow: true, scroll: false });
      setMenuOpen(false); // Close dropdown when a choice is made
    };

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= 1225);
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
                <span className={styles.arrow} styke={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease-in-out' }}>
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

        <div className={styles.headerSection}>

          {/* Group name as title */}
          {selectedGroup !== "All members" && (
            <h2 className={styles.groupTitle}>{selectedGroup}</h2>
          )}

        {/* Year navigation */}
        {selectedGroup === "All members" && (
          <div className={styles.yearNav}>
            <button className={styles.prevButton} onClick={goToPrevYear} disabled={currentYearIndex === years.length - 1}>
              ◀
            </button>

            <h3 className={styles.yearTitle}>Project {selectedYear}</h3>

            <button className={styles.nextButton} onClick={goToNextYear} disabled={currentYearIndex === 0}>
              ▶
            </button>
          </div>
        )}

        {/* Group members by group */}
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
        
        {/* Display group members */}
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
  };

  export default TeamOverview;
