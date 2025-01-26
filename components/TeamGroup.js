import React from 'react';
import TeamMember from './TeamMember'; // Component for individual members
import styles from '../styles/TeamGroup.module.css';

const TeamGroup = ({ members }) => {
    return (
        <div className={styles.container}>
            <div className={styles.memberContainer}>
                {members.map(member => (
                    <TeamMember 
                        key={member.id}
                        name={member.name}
                        title={member.title}
                        image={member.image}
                        email={member.email}
                    />
                ))}
            </div>
        </div>
    );
};

export default TeamGroup;