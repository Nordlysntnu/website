import styles from '@shared/styles/BlogContainer.module.css';
import BlogEntry from '@shared/components/BlogEntry';
import { blogs } from '@shared/data/blog';
import Content from '@shared/components/Content'
import Link from 'next/link';

const BlogPreview = () => {
	const BlogText = blogs[0].text;
	const BlogImages = blogs[0].images;
	const BlogDate = blogs[0].date;
	//return (
	//<Content blue>
	//	<div style={{width: "100%", position: "absolute", zIndex:"-1"}}>
	//	    <video autoPlay muted loop playsInline poster="/posters/Ribbon.png" className={styles.ribbon}>
	//	        <source src="/videos/RibbonWStars.mp4" type="video/mp4" />
	//	    </video>
	//	</div>
	//    <div styles={{position: "relative", zIndex: "1"}}>
	//		<h1 className={styles.headline}>What have we done recently?</h1>
	//		<div className={styles.blogdiv}><BlogEntry text={BlogText} image={BlogImage} date={BlogDate}/></div>
	//		<a href="/blog"><p className={styles.link}>See more on our blog &gt; </p></a>
	//	</div>
	//</Content>
	//);
    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <video autoPlay muted loop playsInline poster="/posters/Ribbon.png" className={styles.ribbon}>
                    <source src="/videos/RibbonWStars.mp4" type="video/mp4" />
                </video>
            </div>
            <div className={styles.textContainer}>
				<h1 className={styles.headline}>What have we done recently?</h1>
				<div className={styles.blogdiv}><BlogEntry text={BlogText} image={BlogImages} date={BlogDate}/></div>
	    		<a href="/blog"><p className={styles.link}>See more on our blog &gt; </p></a>
            </div>
        </div>
    )
}

export default BlogPreview;
