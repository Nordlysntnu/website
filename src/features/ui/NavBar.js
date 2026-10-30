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
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <nav className={styles.navbar} aria-label="Main navigation">
                <div className={styles.innerContainer}>
                    <Link href="/" className={styles.logoContainer}>
                        <img className={styles.logo} src={Logo.src} alt="" />
                        Nordlys
                    </Link>
                    <div className={styles.menu}>
                        {
                            pages.map((page) => {
                                if (current == page[0]) {
                                    return <Link key={page[0]} className={`${styles.menuLink} ${styles.currentLink}`} href={page[1]}>{page[0]}</Link>
                                } else {
                                    return <Link key={page[0]} className={styles.menuLink} href={page[1]}>{page[0]}</Link>
                                }
                            })
                        }
                        <Link className={`${styles.menuLink} ${styles.joinLink}`} href="/join">Join</Link>
                        <button type="button" className={styles.hamburgerContainer} onClick={openMenu} aria-label={clicked ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={clicked} aria-controls="mobile-main-menu">
                            <svg className={styles.hamburger} viewBox="-150 -150 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                                <rect className={topLine} x="-150" y="-150" width="300" height="30" fill="white"/>
                                <rect className={midLine} x="-150" y="-15" width="300" height="30" fill="white"/>
                                <rect className={botLine} x="-150" y="120" width="300" height="30" fill="white"/>
                            </svg>
                        </button>
                    </div>
                    <div id="mobile-main-menu" className={styles.smallMenu} style={{display: displayState}}>
                        {
                            pages.map((page) => {
                                if (current == page[0]) {
                                    return <Link key={page[0]} className={`${styles.menuLink} ${styles.currentLink}`} style={{display: 'inline-block'}} href={page[1]}>{page[0]}</Link>
                                } else {
                                    return <Link key={page[0]} className={styles.menuLink} style={{display: 'inline-block'}} href={page[1]}>{page[0]}</Link>
                                }
                            })
                        }
                        <Link className={`${styles.menuLink} ${styles.joinLink}`} style={{display: 'inline-block'}} href="/join">Join</Link>
                    </div>
                </div>
            </nav>
    )
}
