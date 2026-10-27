
import React, { useState, useEffect, useMemo } from 'react';
import TeamGroup from './TeamGroup';
import styles from './styles/TeamOverview.module.css';
import SubPart1 from '@shared/components/SubPart1';
import { useRouter } from 'next/router';

// Update these imports when adding new projects.
import project2025 from './data/project2025.json';
import project2026 from './data/project2026.json';
import project2027 from './data/project2027.json';

const projects = {
  2025: project2025,
  2026: project2026,
  2027: project2027,
};

// TODO: Update JSON to allow multiple groups per member
// TODO: Update JSON image paths for missing images

const TeamOverview = () => {
  const router = useRouter();

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('All members');
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Get available years, newest first.
  const years = useMemo(
    () => Object.keys(projects).map(Number).sort((a, b) => b - a),
    []
  );

  // Select the newest year by default.
  useEffect(() => {
    if (selectedYear === null && years.length > 0) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  // Get the selected year's JSON data.
  const currentProject = selectedYear
    ? projects[selectedYear]
    : null;

  // Get groups from the selected project's JSON.
  const groups = useMemo(() => {
    if (!currentProject?.groups) return [];

    return currentProject.groups
      .map((group) => group.name)
      .filter(Boolean);
  }, [currentProject]);

  // Add "All members" to the navigation.
  const navigationGroups = useMemo(
    () => ['All members', ...groups],
    [groups]
  );

  // Reset the selected group if it doesn't exist in this project.
  useEffect(() => {
    if (
      selectedGroup !== 'All members' &&
      !groups.includes(selectedGroup)
    ) {
      setSelectedGroup('All members');
    }
  }, [selectedYear, groups, selectedGroup]);

  // Get the selected group's data and description.
  const selectedGroupData = useMemo(() => {
    if (
      !currentProject?.groups ||
      selectedGroup === 'All members'
    ) {
      return null;
    }

    return currentProject.groups.find(
      (group) => group.name === selectedGroup
    );
  }, [currentProject, selectedGroup]);

  // Get members belonging to the selected group.
  const membersForSelectedGroup = useMemo(() => {
    if (
      !currentProject?.members ||
      selectedGroup === 'All members'
    ) {
      return [];
    }

    return currentProject.members.filter(
      (member) => member.group === selectedGroup
    );
  }, [currentProject, selectedGroup]);

  // Build the list of groups and members for "All members".
  const groupsWithMembers = useMemo(() => {
    if (!currentProject?.members) return [];

    return groups
      .map((groupName) => ({
        name: groupName,
        members: currentProject.members.filter(
          (member) => member.group === groupName
        ),
      }))
      .filter((group) => group.members.length > 0);
  }, [currentProject, groups]);

  // Read the selected year and group from the URL.
  useEffect(() => {
    if (!router.isReady) return;

    const queryYear = Number(router.query.year);

    const queryGroup = Array.isArray(router.query.group)
      ? router.query.group[0]
      : router.query.group;

    if (years.includes(queryYear)) {
      setSelectedYear(queryYear);
    }

    if (queryGroup) {
      const matchingGroup = navigationGroups.find(
        (group) =>
          group.toLowerCase() === queryGroup.toLowerCase()
      );

      if (matchingGroup) {
        setSelectedGroup(matchingGroup);
      }
    } else {
      setSelectedGroup('All members');
    }
  }, [
    router.isReady,
    router.query.year,
    router.query.group,
    years,
    navigationGroups,
  ]);

  // Update the URL when the year or group changes.
  const updateUrl = (year, group) => {
    if (year === null) return;

    const query = {
      ...router.query,
      year: String(year),
      group:
        group === 'All members'
          ? undefined
          : group.toLowerCase(),
    };

    // Remove undefined query values.
    Object.keys(query).forEach((key) => {
      if (query[key] === undefined) {
        delete query[key];
      }
    });

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      {
        shallow: true,
        scroll: false,
      }
    );
  };

  // Change project year and preserve the group if possible.
  const handleYearChange = (year) => {
    const newProject = projects[year];

    const newGroups =
      newProject?.groups?.map((group) => group.name) || [];

    const nextGroup =
      selectedGroup !== 'All members' &&
      newGroups.includes(selectedGroup)
        ? selectedGroup
        : 'All members';

    setSelectedYear(year);
    setSelectedGroup(nextGroup);
    setMenuOpen(false);

    updateUrl(year, nextGroup);
  };

  // Change the selected group.
  const handleGroupChange = (group) => {
    setSelectedGroup(group);
    setMenuOpen(false);

    updateUrl(selectedYear, group);
  };

  // Detect screen size for responsive navigation.
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1225);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Wait until the selected project is available.
  if (!currentProject) {
    return null;
  }

  const currentYearIndex = years.indexOf(selectedYear);

  return (
    <div className={styles.container}>
      {/* Group navigation */}
      <nav className={styles.navbar}>
        <div
          className={styles.mobileToggle}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {isMobile && (
            <span>
              {selectedGroup}

              <span
                className={styles.arrow}
                style={{
                  transform: menuOpen
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',
                  transition: 'transform 0.3s ease-in-out',
                }}
              >
                ▼
              </span>
            </span>
          )}
        </div>

        {isMobile ? (
          menuOpen && (
            <ul className={styles.mobileNav}>
              {navigationGroups.map((group) => (
                <li
                  key={group}
                  onClick={() => handleGroupChange(group)}
                  className={
                    selectedGroup === group
                      ? styles.active
                      : ''
                  }
                >
                  {group}
                </li>
              ))}
            </ul>
          )
        ) : (
          <ul className={styles.navList}>
            {navigationGroups.map((group) => (
              <li
                key={group}
                onClick={() => handleGroupChange(group)}
                className={
                  selectedGroup === group
                    ? styles.active
                    : ''
                }
              >
                {group}
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className={styles.headerSection}>
        {/* Project year navigation */}
        <div className={styles.yearNav}>
          <button
            className={styles.prevButton}
            onClick={() => {
              if (currentYearIndex < years.length - 1) {
                handleYearChange(
                  years[currentYearIndex + 1]
                );
              }
            }}
            disabled={currentYearIndex === years.length - 1}
            aria-label="Previous project year"
          >
            ◀
          </button>

          <h3 className={styles.yearTitle}>
            Project {selectedYear}
          </h3>

          <button
            className={styles.nextButton}
            onClick={() => {
              if (currentYearIndex > 0) {
                handleYearChange(
                  years[currentYearIndex - 1]
                );
              }
            }}
            disabled={currentYearIndex === 0}
            aria-label="Next project year"
          >
            ▶
          </button>
        </div>

        {/* Display all groups for the selected year. */}
        {selectedGroup === 'All members' && (
          <div>
            {groupsWithMembers.map(({ name, members }) => (
              <div key={name}>
                <h3 className={styles.groupTitle}>
                  {name}
                </h3>

                <TeamGroup
                  members={members}
                />
              </div>
            ))}
          </div>
        )}

        {/* Display only the selected group's members. */}
        {selectedGroup !== 'All members' && (
          <div>
            <h2 className={styles.groupTitle}>
              {selectedGroup}
            </h2>

            <TeamGroup
              members={membersForSelectedGroup}
            />
          </div>
        )}
      </div>

      {/* Display the selected group's JSON description. */}
      {selectedGroupData?.description && (
        <SubPart1
          dark={true}
          image={`/images/compressed/${selectedGroup}team.jpg`}
          title={selectedGroup}
          text={<p>{selectedGroupData.description}</p>}
          link=""
          linkText=""
        />
      )}
    </div>
  );
};

export default TeamOverview;
