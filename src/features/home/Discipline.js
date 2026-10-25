import Image from 'next/image';
import Link from 'next/link';
import styles from './styles/Discipline.module.css';

export default function Discipline({ title, image }) {
    const teamSlug = title.replace(/\s+/g, '').toLowerCase();

    return (
        <Link href={'/team?group=' + teamSlug} className={styles.container}>
            <Image src={image} alt="" width={72} height={72} sizes="72px" className={styles.image} />
            <span className={styles.title}>{title}</span>
        </Link>
    );
}
