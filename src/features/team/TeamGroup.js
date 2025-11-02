import React from 'react';
import TeamMember from './TeamMember'; // Component for individual members
import styles from './styles/TeamGroup.module.css';

const TeamGroup = ({ year, members }) => {
    return (
        <div className={styles.container}>
            <div className={styles.memberContainer}>
                {members.map(member => {
		    const currentHistory = member.history.find(h => h.year === year);
		    const currentTitle = currentHistory?.title;
                    return <TeamMember 
                        key={member.id}
                        name={member.name}
                        title={currentTitle}
                        image={member.image}
                        fullImage={member.fullImage}
                        email={member.email}
                        linkedin={member.linkedin}
                        phone={member.phone}
                    />
                })}
            </div>
        </div>
    );
};
export default TeamGroup;
