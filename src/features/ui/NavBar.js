import styles from './styles/NavBar.module.css';
import Logo from '@assets/symbols-and-logos/Logo.png';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function NavBar({ current }) {
    const pages = [["Home", "/"], ["About", "/about"], ["Team", "/team"], ["Partners", "/partners"], ["Blog", "/blog"], ["Wiki", "https://wiki.nordlysntnu.no"]]
    const [clicked, setClicked] = useState(false);
    const [displayState, setDisplayState] = useState('none')
    const [topLine, setTopLine] = useState(`${styles.topLine}`)
    const [midLine, setMidLine] = useState(`${styles.midLine}`)
    const [botLine, setBotLine] = useState(`${styles.botLine}`)


    function openMenu() {
        if (clicked) {
            setTopLine(`${styles.topLine}`)
            setMidLine(`${styles.midLine}`)
            setBotLine(`${styles.botLine}`)
            setDisplayState('none')
            setClicked(false)
        } else {
            setTopLine(`${styles.crossTopLine}`)
            setMidLine(`${styles.crossMidLine}`)
            setBotLine(`${styles.crossBotLine}`)
            setDisplayState('flex')
            setClicked(true)
        }
    }

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth > 750) {
                setTopLine(`${styles.topLine}`)
                setMidLine(`${styles.midLine}`)
                setBotLine(`${styles.botLine}`)
                setDisplayState('none')
                setClicked(false)
            }
        }
        window.addEventListener('resize', handleResize)
    })

    return (
        <div className={styles.navbar}>
                <div className={styles.innerContainer}>
                    <Link href="/" className={styles.logoContainer}>
                        <img className={styles.logo} src={Logo.src} />
                        Nordlys
                    </Link>
                    <div className={styles.menu}>
                        {
                            pages.map((page) => {
                                if (current == page[0]) {
                                    return <Link className={`${styles.menuLink} ${styles.currentLink}`} href={page[1]}>{page[0]}</Link>
                                } else {
                                    return <Link className={styles.menuLink} href={page[1]}>{page[0]}</Link>
                                }
                            })
                        }
                        <Link className={`${styles.menuLink} ${styles.joinLink}`} href="/join">Join</Link>
                        <a className={styles.hamburgerContainer} onClick={openMenu}>
                            <svg className={styles.hamburger} viewBox="-150 -150 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect className={topLine} x="-150" y="-150" width="300" height="30" fill="white"/>
                                <rect className={midLine} x="-150" y="-15" width="300" height="30" fill="white"/>
                                <rect className={botLine} x="-150" y="120" width="300" height="30" fill="white"/>
                            </svg>
                        </a>
                    </div>
                    <div className={styles.smallMenu} style={{display: displayState}}>
                        {
                            pages.map((page) => {
                                if (current == page[0]) {
                                    return <Link className={`${styles.menuLink} ${styles.currentLink}`} style={{display: 'inline-block'}} href={page[1]}>{page[0]}</Link>
                                } else {
                                    return <Link className={styles.menuLink} style={{display: 'inline-block'}} href={page[1]}>{page[0]}</Link>
                                }
                            })
                        }
                        <Link className={`${styles.menuLink} ${styles.joinLink}`} style={{display: 'inline-block'}} href="/join">Join</Link>
                    </div>
                </div>
            </div>
    )
}
