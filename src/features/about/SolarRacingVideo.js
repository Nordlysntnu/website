import { useEffect, useRef, useState } from 'react';
import Content from '@shared/components/Content';
import styles from './styles/SolarRacingVideo.module.css';

const videoId = 'R_lVdrHnbYo';
const videoTitle = 'Engineering the World’s Fastest Solar Race Cars';
const videoSource = 'Seeker on YouTube';

// The YouTube player is only loaded after the visitor presses play,
// so nothing is sent to YouTube just by opening the page.
export default function SolarRacingVideo({ dark }) {
    const [playing, setPlaying] = useState(false);
    const frameRef = useRef(null);

    // The play button disappears, so keep keyboard focus in the player.
    useEffect(() => {
        if (playing) frameRef.current?.focus();
    }, [playing]);

    return (
        <Content dark={dark}>
            <section className={styles.container} aria-labelledby="solar-racing-title">
                <div className={styles.heading}>
                    <p className={styles.eyebrow}>Solar racing</p>
                    <h2 id="solar-racing-title" className={styles.title}>What is solar racing?</h2>
                </div>
                <div className={styles.intro}>
                    <p className={styles.text}>
                        To solve the problems of tomorrow, nothing is more important than thinking new. Solar racing pushes the limit of technology and solar energy innovation through competition. Who can drive the fastest and get to the finish line before running out of energy?
                    </p>
                    <p className={styles.text}>See how teams from around the world design and build their solar cars.</p>
                </div>

                <figure className={styles.figure}>
                    <div className={styles.player}>
                        {playing ? (
                            <iframe
                                ref={frameRef}
                                className={styles.frame}
                                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                                title={videoTitle}
                                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"

                                referrerPolicy="strict-origin-when-cross-origin"
                            />
                        ) : (
                            <button
                                type="button"
                                className={styles.cover}
                                onClick={() => setPlaying(true)}
                                aria-label={`Play video: ${videoTitle}, ${videoSource}`}
                            >
                                <img
                                    src="/posters/compressed/solar-racing-960.webp"
                                    srcSet="/posters/compressed/solar-racing-960.webp 960w, /posters/compressed/solar-racing-1600.webp 1600w"
                                    sizes="(min-width: 1200px) 1000px, 100vw"
                                    alt=""
                                    width={1600}
                                    height={900}
                                    loading="lazy"
                                    decoding="async"
                                    className={styles.coverImage}
                                />
                                <span className={styles.play} aria-hidden="true">
                                    <svg viewBox="0 0 24 24" focusable="false"><path d="M8 5.5v13l10.5-6.5z" /></svg>
                                </span>
                                <span className={styles.label} aria-hidden="true">
                                    <span className={styles.videoTitle}>{videoTitle}</span>
                                    <span className={styles.source}>Video · {videoSource}</span>
                                </span>
                            </button>
                        )}
                    </div>
                    <figcaption className={styles.note}>
                        The video loads from YouTube when you press play.{' '}
                        <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer" className={styles.external}>
                            Open on YouTube<span aria-hidden="true"> ↗</span>
                        </a>
                    </figcaption>
                </figure>
            </section>
        </Content>
    );
}
