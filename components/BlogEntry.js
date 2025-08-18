import styles from '../styles/BlogEntry.module.css';

const BlogEntry = ({ text, image }) => {
	return (
	<div className={styles.blogEntry}>
		<p>{text}</p>
		<img src={image} alt="failed" />
	</div>
	);
}

export default BlogEntry;
