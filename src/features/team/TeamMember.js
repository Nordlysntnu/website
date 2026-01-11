import React, {useState, useEffect} from 'react';
import Image from 'next/image'
import styles from './styles/TeamMember.module.css';
import ContactRibbon from './ContactRibbon';
import Link from 'next/link';

const TeamMember = ({ name, title, image, fullImage, email, linkedin, phone }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key == 'Escape') setIsModalOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (name == "You?") { return (
        //<div className={styles.container}>
            //<Image className={styles.image} 
		//src={image} 
		//alt={`${name}'s profile`} 
		//onClick={() => window.location.href = "/join"}/>
            //<div className={styles.textContainer}>
                //<p className={styles.name}>{name}</p>
                //<p className={styles.position}>{title}</p>
                //<a href={`https://nordlysntnu.no/join`} className={styles.link}>Click here!</a>
            //</div>
        //</div>
        <div className={styles.container}>
            <div className="topGroup">
                <Image className={`${styles.image} ${styles.clickable}`}  src={image} alt={`${name}'s profile`} onClick={() => window.location.href = "/join"}/>
                <div className={styles.textContainer}>
                    <p className={styles.name}>{name}</p>
                    <p className={styles.position}>{title}</p>
                </div>
            </div>
            <div style={{'margin': 'auto', 'text-align': 'center'}}>
                <Link href="/join" className={styles.joinButton}><p style={{'color': 'rgb(255,255,255)'}}>Join!</p></Link>
            </div>
        </div>
    );}

    return (
        <>
        <div className={styles.container}>
            <div className="topGroup">
            <Image className={`${styles.image} ${styles.clickable}`}  src={image} alt={`${name}'s profile`} onClick={() => setIsModalOpen(true)}/>
            <div className={styles.textContainer}>
                <p className={styles.name}>{name}</p>
                <p className={styles.position}>{title}</p>
            </div>
            </div>
            <ContactRibbon email={email} linkedin={linkedin} phone={phone} />
        </div>

        {isModalOpen && (
            <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                        x
                    </button>
                    <Image src={fullImage || image} alt={`${name}'s profile (full size)`} fill className={styles.fullImage}/>
                </div>
            </div>
        )}
        </>
    );
};

export default TeamMember;
