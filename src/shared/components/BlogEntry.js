import styles from '../styles/BlogEntry.module.css';
import React, {useState} from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Image from 'next/image';

const BlogEntry = ({ text, images = [], date }) => {

	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	return (
	<div className={styles.blogEntry}>
		<h1>{date}</h1>
		<p>{text}</p>

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