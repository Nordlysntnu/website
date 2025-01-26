import React, { useState, useEffect } from 'react';
import TeamGroup from './TeamGroup';
import { members } from '../data/members';
import styles from '../styles/TeamOverview.module.css';

const teamGroups = ['Board', 'Electrical', 'Mechanical','Strategy', 'Brand', 'Logistics', 'Technical advisor','Alumni', 'All active members'];

const groupDescriptions = {
    'Board': <p><b>The Board</b> of Nordlys is the deciding and guiding force of our organization, consisting of group leaders and exceptional students. Every major decision goes either thru, or is made by the board, which makes its members exposed to great responsibility. With this responsibility also comes power, which the board members are expected to handle with care and respect. The board is the very pilar of which the other groups stand, and what nurtures their ability to grow and preform. </p> ,
    'Electrical': <p><b>The Electrical group</b> is responsible for every electrical component of the car. They design, implement, and monitor complex electrical systems to ensure optimal energy efficiency and reliability. As a top two group size-wise within Nordlys, the electrical group is a major part of the organization. Preforming electrical components is vital in a good solar car, which causes the members focus in details to be unprecedented. The electrical group is fundamentally important in our chase to become world-leading in our field. </p>,
    'Mechanical': <p><b>The Mechanical group</b> is responsible for every non-electrical, physical component in the car. From suspension to roll cage, the mechanical group does it all. The significant drive to make the cars lighter and sturdier than ever before, pushes the mechanical group to the edge as they balance reliability, sturdiness, weight and performance. As a top two group size-wise within Nordlys, the mechanical group is undeniably vital in the ultimate performance of our car. </p>,
    'Strategy': <p><b>The Strategy group</b>  is responsible for analyzing data and developing race plans to maximize the car’s performance during competitions. The group uses insight in weather patterns, energy consumption, and road conditions to create plans for the most efficient way to complete a competition. Without good race plans and strategies, even the best of solar cars will be left behind, which makes the strategy group vital for Nordlys’ chase to become world leading.</p>,
    'Brand': <p><b>The Brand group</b> shapes the public image of Nordlys, aiming to build awareness and excitement in our team’s mission. Thru social media, stands, financial connections and web solutions the brand group works towards gaining sponsorships, recruiting talent and improving the overall brand of Nordlys. As in-house talent and sponsorships are vital for our organization’s survival, the brand makes up an important supporting pilar in our organization.</p>,
    'Logistics': <p><b>The Logistics group</b> is responsible for all transportation and logistics related to the competition in a cost-effective manner. This includes everything from transportation planning, customs clearance, documentation, equipment handling, supply chain logistics, and compliance with various regulations that must be followed. The team also ensures that every piece of equipment, from the solar car itself to the smallest tools, arrives on time and in perfect condition. They manage both international and domestic logistics, coordinating with shipping companies, airlines, and local service providers to streamline the process. The group is essential in allowing the rest of the team to focus solely on the competition without having to worry about the practicalities of transport and logistics. Their work guarantees that all resources are in the right place at the right time, enabling the team to perform at their best.</p>,
    'Technical advisor': <p></p>,
    'Alumni': <p><b>The Alumni</b> consists of former Nordlys members. We are proud to present our former members who all contributed to shaping Nordlys into the organization it is today.</p>,
    'All active members': <p> </p>
};

const TeamOverview = () => {
    const [selectedGroup, setSelectedGroup] = useState('Board');
    const [isMobile, setIsMobile] = useState(false); // Initial default, updated in useEffect

    useEffect(() => {
        // Set initial isMobile state only if window is defined (i.e., client-side)
        const handleResize = () => setIsMobile(window.innerWidth <= 1050);

        if (typeof window !== 'undefined') {
            handleResize(); // Set initial value based on window width
            window.addEventListener('resize', handleResize);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    const handleGroupChange = (group) => {
        setSelectedGroup(group);
    };

    const groupMembers = members.filter(member => member.group === selectedGroup);

    return (
        <div className={styles.container}>
            {/* Navigation bar */}
            <nav className={styles.navbar}>
                <ul className={isMobile ? styles.mobileNav : ''}>
                    {teamGroups.map(group => (
                        <li key={group} onClick={() => handleGroupChange(group)} className={selectedGroup === group ? styles.active : ''}>
                            {group}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Group name as title */}
            <h2 className={styles.groupTitle}>{selectedGroup}</h2>

            {/* Display group members */}
            <TeamGroup members={groupMembers} />

            {/* Information section */}
            <div className={styles.groupInfo}>
                <div className={styles.description}>
                    {groupDescriptions[selectedGroup]}
                </div>
                <div className={styles.images}>
                    <img src={`/${selectedGroup}team.png`} alt={`${selectedGroup}`} />
                </div>
            </div>
        </div>
    );
};

export default TeamOverview;