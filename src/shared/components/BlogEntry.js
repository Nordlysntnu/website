import { useState } from 'react';
import styles from '../styles/BlogEntry.module.css';

const BlogEntry = ({ text, image, date }) => {
	
	const [collapsed, setCollapsed] = useState(false);

	return (
	<div className={styles.blogEntry}>
		<h1>{date}</h1>
		<span>
			<p>{text}</p>
			<p styles={{'color': 'red'}}>Show more</p>
		</span>
		<img src={image} alt="failed" />
	</div>
	);
}

export default BlogEntry;
