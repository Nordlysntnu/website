import styles from '../styles/TeamGroup.module.css';
import Content from './Content';
import TeamMember from './TeamMember';

export default function TeamGroup({ groupName, members, text }) {
    const {name, position, image} = members
    console.log(members[0].position)
    return (
        <div className={styles.container}>
            <center>
                <h1>{groupName}</h1>
                <p1 className={styles.position}>{text}</p1>
                </center>
                <br></br>
            <div className={styles.memberContainer}>
                {members.map(function(member) {
                    return (
                        <TeamMember name={member.name} position={member.position} image={member.image} email={member.email} />
                    )
                })}
            </div>
        </div>
    )
}