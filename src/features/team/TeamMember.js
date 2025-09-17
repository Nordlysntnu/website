import React from 'react';
import styles from '../styles/TeamMember.module.css';

const TeamMember = ({ name, title, image, email }) => {
    if (name == "You?") { return (
        <div className={styles.container}>
            <img className={styles.image} 
		src={image} 
		alt={`${name}'s profile`} 
		onClick={() => window.location.href = "/join"}/>
            <div className={styles.textContainer}>
                <p className={styles.name}>{name}</p>
                <p className={styles.position}>{title}</p>
                <a href={`https://nordlysntnu.no/join`} className={styles.link}>Click here!</a>
            </div>
        </div>
    );}
    else return (
        <div className={styles.container}>
            <img className={styles.image} src={image} alt={`${name}'s profile`} />
            <div className={styles.textContainer}>
                <p className={styles.name}>{name}</p>
                <p className={styles.position}>{title}</p>
                <a href={`mailto:${email}`} className={styles.link}>Contact</a>
            </div>
        </div>
    );
};

export default TeamMember;






