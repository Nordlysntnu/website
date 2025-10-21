import styles from '../styles/BlogEntry.module.css';
import Image from 'next/image';

	return (
	<div className={styles.blogEntry}>
		<h1>{date}</h1>
		<p>{text}</p>
		<div className={styles.imageWrapper}>
			<Image src={image} alt="Blog image" width={0} height={0} sizes="100vw" className={styles.image} />
		</div>
	</div>
	);
};



export default BlogEntry;
