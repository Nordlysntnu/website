import React from 'react';
import TeamMember from './TeamMember';
import styles from './styles/TeamGroup.module.css';

const TeamGroup = ({ members }) => {
    return (
        <div className={styles.container}>
            <div className={styles.memberContainer}>
                {members.map((member, index) => (
                    <TeamMember
                        key={member.id ?? `${member.name}-${index}`}
                        name={member.name}
                        title={member.title}
                        image={member.image}
                        fullImage={member.fullImage}
                        email={member.email}
                        linkedin={member.linkedin}
                        phone={member.phone}
                    />
                ))}
            </div>
        </div>
    );
};

export default TeamGroup;
