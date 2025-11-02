import styles from '@shared/styles/BlogContainer.module.css';
import { useState, useEffect, useRef } from 'react';
import BlogEntry from '@shared/components/BlogEntry';
import { blogs } from '@shared/data/blog';
import Content from '@shared/components/Content'
import Link from 'next/link';

const BlogPreview = () => {
	const BlogText = blogs[0].text;
	const BlogImages = blogs[0].images;
	const BlogDate = blogs[0].date;

	const [bgHeight, setBgHeight] = useState(0);

	const ref = useRef(null);
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
	useEffect(() => {
		if(ref.current) {
			setBgHeight(parseFloat(ref.current.scrollHeight));
			console.log("offsetHeight: ", ref.current.scrollHeight);
		}
	}, []);

	useEffect(() => {
		console.log("height: ", bgHeight);
	}, [bgHeight]);

    return (
        <div className={styles.container} style = {{'height': bgHeight*1.02}}>
            <div className={styles.imageContainer}>
                <video autoPlay muted loop playsInline poster="/posters/Ribbon.png" className={styles.ribbon}>
                    <source src="/videos/RibbonWStars.mp4" type="video/mp4" />
                </video>
            </div>
            <div ref={ref} className={styles.textContainer}>
				<h1 className={styles.headline}>What have we done recently?</h1>
				<div className={styles.blogdiv}><BlogEntry text={BlogText} images={BlogImages} date={BlogDate}/></div>
	    		<a href="/blog"><p className={styles.link}>See more on our blog &gt; </p></a>
            </div>
        </div>
    )
}

export default BlogPreview;
