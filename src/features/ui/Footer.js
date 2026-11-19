import Link from 'next/link';
import styles from './styles/Footer.module.css';
import ContactPane from './ContactPane';
import { ORGANIZATION } from './organization';
import Logo from '@assets/symbols-and-logos/Logo.png';
import Instagram from '@assets/symbols-and-logos/Instagram.svg';
import Facebook from '@assets/symbols-and-logos/Facebook.svg';
import Linkedin from '@assets/symbols-and-logos/Linkedin.svg';

const socials = [
    ['Instagram', 'https://www.instagram.com/nordlysntnu/', Instagram],
    ['LinkedIn', 'https://www.linkedin.com/company/nordlysntnu/', Linkedin],
    ['Facebook', 'https://www.facebook.com/nordlysntnu', Facebook],
];

const pages = [['About', '/about'], ['Team', '/team'], ['Partners', '/partners'], ['Blog', '/blog'], ['Join us', '/join']];

export default function Footer() {
    const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <>
            <section id="contact" className={styles.contact} aria-labelledby="contact-title">
                <div className={styles.contactInner}>
                    <div className={styles.intro}>
                        <p className={styles.eyebrow}>Contact</p>
                        <h2 id="contact-title" className={styles.title}>Get in touch</h2>
                        <p className={styles.lead}>
                            Questions about the team, sponsorships or joining? Send us a message and we&apos;ll get back to you.
                        </p>
                        <div className={styles.person}>
                            <p className={styles.personRole}>{ORGANIZATION.contact.role}</p>
                            <p className={styles.personName}>{ORGANIZATION.contact.name}</p>
                            <a href={`mailto:${ORGANIZATION.contact.email}`}>{ORGANIZATION.contact.email}</a>
                            <a href={`tel:${ORGANIZATION.contact.tel}`}>{ORGANIZATION.contact.phone}</a>
                        </div>
                    </div>
                    <ContactPane />
                </div>
            </section>

            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.brand}>
                        <Link href="/" className={styles.logo}>
                            <img src={Logo.src} alt="" />
                            <span>Nordlys</span>
                        </Link>
                        <p>Norway&apos;s first solar racing team, from NTNU in Trondheim.</p>
                        <div className={styles.socials}>
                            {socials.map(([name, href, icon]) => (
                                <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Nordlys on ${name}`}>
                                    <img src={icon.src} alt="" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className={styles.column}>
                        <h3>Visit us</h3>
                        <address>
                            {ORGANIZATION.name}<br />
                            {ORGANIZATION.address.map(line => <span key={line}>{line}<br /></span>)}
                        </address>
                        <p className={styles.orgNumber}>Org. no. {ORGANIZATION.orgNumber}</p>
                    </div>

                    <div className={styles.column}>
                        <h3>Explore</h3>
                        <ul>
                            {pages.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}
                        </ul>
                    </div>

                    <div className={styles.column}>
                        <h3>Members</h3>
                        <ul>
                            <li><a href="https://wiki.nordlysntnu.no" target="_blank" rel="noopener noreferrer">Member wiki ↗</a></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <span suppressHydrationWarning>
                        © {new Date().getFullYear()} {ORGANIZATION.name} · Created by and for students · <Link href="/terms" className={styles.terms}>Terms of sale and privacy</Link>
                    </span>
                    <button type="button" className={styles.toTop} onClick={toTop}>Back to top ↑</button>
                </div>
            </footer>
        </>
    );
}
