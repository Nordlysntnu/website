import styles from '../styles/GoalCard.module.css';
import {useEffect, useRef, useState} from 'react'

export default function GoalCardOl({ image, title, text }) {
    const [open, setOpen] = useState(false)
    const [path, setPath] = useState(styles.openIcon)
    const [elementHeight, setElementHeight] = useState(0)
    const [bottom, setBottom] = useState(0)
    const [elementOpacity, setElementOpacity] = useState(0)
    const ref = useRef(null)

    function handleClick() {
        if (open) {
            setPath(styles.openIcon)
            setBottom(0)
            setElementOpacity(0)
            setOpen(false)
        } else {
            setPath(styles.closeIcon)
            setBottom(elementHeight)
            setElementOpacity(1)
            setOpen(true)
        }
    }

    useEffect(() => {
        function handleResize() {
            if (ref.current !== null) {
                const h = ref.current.scrollHeight
                setElementHeight(h)
            }
        }
        handleResize()
        window.addEventListener('resize', handleResize)
    })

    return (
        <div className={styles.container} onClick={handleClick} >
            <div className={styles.top}>
                <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 180" fill="none">
                    <path className={path} fill="#D9D9D9"/>
                </svg>  
                <h2 className={styles.title}>
                    {title}
                </h2>            
            </div>
            <div className={styles.bottom} ref={ref} style={{ height: bottom, opacity: elementOpacity }}>
                <div className={styles.bottomText}>
                    {text}
                </div>
                <div className={styles.bottomImage}>
                    <img src={image} />
                </div>
            </div>
        </div>
    )
}