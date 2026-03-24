import styles from '@shared/styles/BlogContainer.module.css';
import BlogEntry from '@shared/components/BlogEntry';
import { blogs } from '@shared/data/blog';

const BlogPreview = () => {
  const BlogText = blogs[0].text;
  const BlogImages = blogs[0].images;
  const BlogDate = blogs[0].date;

  return (
    <div className={styles.container}>
      {/* Ribbon video background */}
      <div className={styles.ribbonContainer}>
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/posters/Ribbon.png"
          className={styles.ribbon}
        >
          <source src="/videos/compressed/Stars.webm" type="video/webm" />
        </video>
      </div>

      {/* Overlay content */}
      <div className={styles.overlay}>
        <h1 className={styles.headline}>What have we done recently?</h1>

        <div className={styles.blogWrapper}>
          <BlogEntry text={BlogText} images={BlogImages} date={BlogDate} />
        </div>

        <div className={styles.linkContainer}>
          <a href="/blog" className={styles.link}>
            See more on our blog &gt;
          </a>
        </div>
      </div>
    </div>
  );
};

export default BlogPreview;