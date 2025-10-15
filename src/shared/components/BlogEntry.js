import styles from '../styles/BlogEntry.module.css';
import Image from 'next/image';

const BlogEntry = ({ text, image, date }) => {
	return (
	<div className={styles.blogEntry}>
		<h1>{date}</h1>
		<p>{text}</p>
		<Image src={image} alt="failed" />
	</div>
	);
}

export default BlogEntry;
