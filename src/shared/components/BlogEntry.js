import styles from '@shared/styles/BlogEntry.module.css';
import React, {useEffect, useState, useRef} from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Image from 'next/image';

function textField(text) {

}

const BlogEntry = ({ text, images = [], date }) => {
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	const [collapsed, setCollapsed] = useState(true);
	const [collapsible, setCollapsible] = useState(false);
	
	const maxLines = 7;

	const pRef = useRef(null);

	useEffect(() => {
		const el = pRef.current;
		
		const lh = parseFloat(window.getComputedStyle(el).fontSize)*0.2;
		console.log('lh = ', lh)
		const maxHeight = parseFloat(window
			.getComputedStyle(el)
			.fontSize
		) * maxLines*1.2;


		if (el.scrollHeight > maxHeight && window.innerWidth < 768) {
			setCollapsible(true);
		}

		console.log("scrollheight: ", el.scrollHeight, ", maxHeight: ", maxHeight);

	}, []);

	return (
	<div className={styles.blogEntry}>
		<h1>{date}</h1>
		<p 
			ref={pRef}
			className = {collapsed && collapsible ? styles.pcollapsed : styles.pexpanded}
		>
			{text}
		</p>
		{collapsible && (
			<p
				onClick={() => setCollapsed(!collapsed)}
				className={styles.preadmore}
			>
				{collapsed ? 'Read More >' : 'Read Less >'}
			</p>
		)}
		{/* Image thumbnails */}
		<div className={styles.imageGrid} data-count={Math.min(images.length, 4)}>
			{images.slice(0, 4).map((imgSrc, idx) => (
				<div key={idx} className={styles.thumbnailWrapper} onClick={() => {
					setCurrentIndex(idx);
					setLightboxOpen(true);
				}}
				>
					<Image src={imgSrc} alt={`Blog image ${idx + 1}`} width={800} height={600} className={styles.image}
					/>
					{idx == 3 && images.length > 4 && (
						<div className={styles.moreOverlay}>+{images.length - 4}</div>
					)}
					</div>
			))}
		</div>

		{/*lightbox viewer */}
		{lightboxOpen && (
			<Lightbox open={lightboxOpen} close={() =>
				setLightboxOpen(false)}
				index={currentIndex}
				slides={images.map((src) => ({ src }))}
				/>
			)}
	</div>
	);
};



export default BlogEntry;
