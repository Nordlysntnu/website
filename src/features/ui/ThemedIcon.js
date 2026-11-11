import Image from 'next/image';
import styles from './styles/ThemedIcon.module.css';

// Shows `light` normally and `dark` (when given) in dark mode.
// Both are lazy images, so the hidden one is not downloaded.
export default function ThemedIcon({ light, dark, className = '', alt = '', ...props }) {
    if (!dark) return <Image src={light} alt={alt} className={className} {...props} />;
    return (
        <>
            <Image src={light} alt={alt} className={`${className} ${styles.light}`} {...props} />
            <Image src={dark} alt={alt} className={`${className} ${styles.dark}`} {...props} />
        </>
    );
}
