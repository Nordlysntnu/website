import styles from '../styles/BlogEntry.module.css';

const BlogEntry = ({ text, image, date }) => {
	return (
	<div className={styles.blogEntry}>
		<h1>{date}</h1>
		<p>{text}</p>
		<img src={image} alt="failed" />
	</div>
	);
}

export default BlogEntry;
