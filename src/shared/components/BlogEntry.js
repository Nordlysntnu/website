import { useState } from 'react';
import styles from '../styles/BlogEntry.module.css';
import Image from 'next/image';

const BlogEntry = ({ text, image, date }) => {
	
	const [collapsed, setCollapsed] = useState(false);

	return (
	<div className={styles.blogEntry}>
		<h1>{date}</h1>
		<span>
			<p>{text}</p>
			<p styles={{'color': 'red'}}>Show more</p>
		</span>
		<Image src={image} alt="Blog image" width={0} height={0} sizes="100vw" className={styles.image} />
	</div>
	);
}

export default BlogEntry;
