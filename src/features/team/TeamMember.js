import React from 'react';
import Image from 'next/image'
import styles from './styles/TeamMember.module.css';
import Instagram from '@assets/symbols-and-logos/Instagram.svg';
import ContactRibbon from './ContactRibbon';

const TeamMember = ({ name, title, image, email, linkedin, phone }) => {
    if (name == "You?") { return (
        <div className={styles.container}>
            <Image className={styles.image} 
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
            <Image className={styles.image} src={image} alt={`${name}'s profile`} width="300" height="300" />
            <div className={styles.textContainer}>
                <p className={styles.name}>{name}</p>
                <p className={styles.position}>{title}</p>
                <ContactRibbon email={email} linkedin={linkedin} phone={phone} />
            </div>
        </div>
    );
};

export default TeamMember;






