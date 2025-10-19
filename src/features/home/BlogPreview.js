import styles from '@shared/styles/BlogContainer.module.css';
import BlogEntry from '@shared/components/BlogEntry';
import { blogs } from '@shared/data/blog';

const BlogPreview = () => {
	const BlogText = blogs[0].text;
	const BlogImages = blogs[0].images;
	const BlogDate = blogs[0].date;
	return (
	<div >
	<div className={styles.container}>
		<h1 className={styles.headline}>Our recent activities </h1>
		<div className={styles.blogdiv} ><BlogEntry text={BlogText} image={BlogImages} date={BlogDate}/></div>
		<a href="/blog"><p className={styles.link}>See more on our blog &gt; </p></a>
	</div>
	</div>
	);
}

export default BlogPreview;
