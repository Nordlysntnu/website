import styles from '../styles/Group.module.css'
import { useState, useRef, useEffect } from "react";
import { AnimationOnScroll } from 'react-animation-on-scroll';
import "animate.css/animate.min.css";

export default function Group({ image, groupName, theses, description }) {
    const [path, setPath] = useState(styles.openIcon)
    const [open, setOpen] = useState(false)
    const [elementHeight, setElementHeight] = useState(0)
    const [bottom, setBottom] = useState(0)
    const ref = useRef(null)

    function handleClick() {
        if (open) {
            setPath(styles.openIcon)
            setBottom(0)
            setOpen(false)
        } else {
            setPath(styles.closeIcon)
            setBottom(elementHeight)
            setOpen(true)
        }
    }

    useEffect(() => {
        function handleResize() {
          const h = ref.current.scrollHeight
          setElementHeight(h)
          if (open) {
            setBottom(h)
          }
        }
        handleResize()
        window.addEventListener('resize', handleResize)
    })

    return (
        <AnimationOnScroll animateIn="animate__fadeInUp" offset={50} animateOnce >
        <div className={styles.group} onClick={handleClick}>
            <h2 className={styles.titleContainer}>
                <img className={styles.titleImage} src={image} />
                {groupName}
                <div className={styles.fillContainer}></div>
                <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180" fill="none">
                    <path className={path} fill="#152242"/>
                </svg>  
            </h2>
            <div className={styles.thesesContainer} ref={ref} style={{ height: bottom }}>
                <div className={styles.groupDescription}>{description}</div>
                {
                    Object.keys(theses).map((thesisName, j) => (
                        (thesisName != 'image' && thesisName != 'name' && thesisName != 'description')? (
                            <div className={styles.thesis}>
                                <span className={styles.thesisTitle}>{theses[thesisName].name}</span>
                                <span className={styles.thesisDescription}>{theses[thesisName].text}</span>
                            </div>
                        ) : (<></>)
                    ))
                }
            </div>
        </div>
        </AnimationOnScroll>
    )
}