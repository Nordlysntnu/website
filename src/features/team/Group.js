import styles from './styles/Group.module.css'
import { useState, useRef, useEffect } from "react";
import ScrollReveal from '@shared/components/ScrollReveal';
import "animate.css/animate.min.css";
import Image from 'next/image';

export default function Group({ image, groupName, theses, description }) {
    const [open, setOpen] = useState(false)
    const [elementHeight, setElementHeight] = useState(0)
    const contentRef = useRef(null)

    function handleClick() {
        setOpen((previous) => !previous)
    }

    useEffect(() => {
        function handleResize() {
            if (!contentRef.current) return
            setElementHeight(contentRef.current.scrollHeight)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [description, theses])

    return (
        <ScrollReveal animateIn="animate__fadeInUp" offset={50}>
        <div className={styles.group} onClick={handleClick}>
            <h2 className={styles.titleContainer}>
                <Image className={styles.titleImage} width={50} height={50} src={image} />
                {groupName}
                <div className={styles.fillContainer}></div>
                <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180" fill="none">
                    <path className={open ? styles.closeIcon : styles.openIcon} fill="#152242"/>
                </svg>  
            </h2>
            <div className={styles.thesesContainer} style={{ height: open ? elementHeight : 0 }}>
                <div ref={contentRef}>
                <div className={styles.groupDescription} dangerouslySetInnerHTML={{ __html: description }} />
                {
                    Object.keys(theses).map((thesisName) => {
                        const thesis = theses[thesisName];
                        return (
                        (thesisName != 'image' && thesisName != 'name' && thesisName != 'description')? (
                            <div className={styles.thesis} key={thesisName}>
                                <span className={styles.thesisTitle}>{thesis.name}</span>
                                <span className={styles.thesisDescription}  dangerouslySetInnerHTML={{ __html: thesis.text}} />
                            </div>
                        ) : null
                    );
                })}
                </div>
            </div>
        </div>
        </ScrollReveal>
    )
}
