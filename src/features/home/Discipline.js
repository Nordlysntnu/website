import ThemedIcon from '@features/ui/ThemedIcon';
import Link from 'next/link';
import styles from './styles/Discipline.module.css';

export default function Discipline({ title, icon }) {

    return (
        <Link href={{ pathname: '/team', query: { group: title.toLowerCase() } }} className={styles.container}>
            <ThemedIcon light={icon.light} dark={icon.dark} width={72} height={72} sizes="72px" className={styles.image} />
            <span className={styles.title}>{title}</span>
        </Link>
    );
}
