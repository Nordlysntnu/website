import Content from "@shared/components/Content";
import styles from './styles/RouteVisualizer.module.css';
import { useEffect, useRef, useState } from "react";

export default function RouteVisualizer({ race, title, description }) {
    const pathRef = useRef(null);
    const [animated, setAnimated] = useState(false);

    const [pathWidth, setPathWidth] = useState(16);
    const [pointRadius, setPointRadius] = useState(56);
    const [fontSize, setFontSize] = useState(16);

    const AustraliaD = "m708.4 502.01c0 37.16-11.92 65.02-27.17 90.8-3.57 6.03-8.05 7.41-12.34 12.89-9.93 12.7-5.87 26.34-19.51 36.53-11.91 8.9-14.48 24.4-14.96 40.51-0.23 7.49-16.51-1.37-21.05 3.27-2.6 2.65-11.77-1.05-15.39 0.98-7.92 4.44-14.63 14.82-23.89 19.37-7.4 3.64-12.6-16.52-21.87-15.24-15.76 2.18-33.59-4.74-52.76-3.26-8.96 0.69-12.09-18.46-21.25-17.17-12.83 1.81 0.4-46.57-11.35-37.37-12.99 10.17-7.22-22.08-19.92-22.08-5.47 0 7.66-30.14 2.17-30.19-2.36-0.02-32.59 33.65-33.93 31.7-4.21-6.11-7.87-20.52-15.34-26.81-5.25-4.43-7.9-11.28-13.4-15.09-8.99-6.23-16.11-2.36-25.66-7.12-5.77-2.87-11.54-7.1-17.37-6.82-8.84 0.42-14.53 2.38-27.09 3.39-20.5 1.66-34.66 14.44-55.05 14.11-17.02-0.28-31.21 35.1-47.69 32.77-18.03-2.55-32.34 4.29-45.13 4.12-11.01-0.14-20.45 29.56-30.42 25.02-14.24-6.49-36.13 2.41-47.822-13.43-5.486-7.44 12.562-6.29 8.105-15.84-2.685-5.75 0.519-12.17 0.268-19.57-0.192-5.68-3.656-12.27-5.863-17.55-2.267-5.42-7.544-9.92-10.006-16.38-1.976-5.18-0.969-12.2-3.938-17.57-4.309-7.8-11.825-15.42-16.082-22.92-2.189-3.86-1.425-8.14-3.718-11.67-6.669-10.26-17.693-14.85-21.19-23.52-2.934-7.27 20.25 5.54 21.256 0.17 0.721-3.84-6.174-8.59-10.094-16.02-4.882-9.25-7.114-21.28-7.114-25.05 0-9.54-2.331-27.06 0.883-34.25 3.198-7.15 8.255-2.79 14.227-7.64 9.028-7.33 17.724-16.67 30.774-23.07 4.513-2.21 11.229-1.81 16.214-3.81 19.33-7.77 39.47-16.91 57.97-26.47 8.73-4.52 11.2-20.1 19.53-25.23 3.65-2.25-6.66-13.07-3.05-15.43 5.29-3.45 1.29-10.87 6.56-14.56 4.16-2.91 15.25 14.97 19.34 11.85 2.64-2.02-4.04-19.61-1.45-21.77 3.35-2.8 15.21 7.51 18.56 4.62 2.61-2.26-7.96-18.51-5.38-20.86 13.61-12.45 31.83-22.7 47.09-34.28 4.46-3.39 19.79 21.93 24.32 18.69 7.28-5.22 18.8 10.12 25.57 3.38 5.6-5.58-11.58-7.92-6.34-15.39 6.96-9.89 12.74-23.67 24.48-33.89 7.92-6.9 20.45 1.94 29.93-2.47 3.02-1.4 4.15-6.15-0.11-9.64-4.05-3.31-13.5-5.34-11.15-7.84 3.29-3.51 22.32 6.61 33.45 6 5.58-0.31 11.7 4.26 13.25 4.26 5.2 0 11.92 5.49 17.06 5.64 3.63 0.1 5.11-5.18 8.7-5.01 7.95 0.38 11.26 2.97 19.04 3.71 7.4 0.69 4.02 10.28-0.88 15.7-2.52 2.79-16.91 7.68-12.68 13.14 4.31 5.55-14.81 19.29-8.17 23.4 25.99 16.08 49.08 45.95 79.91 53.95 24.99 6.49 26.96-48.57 29.67-73.46 1.71-15.72 17.78-64.12 21.46-53.82 3.84 10.76 7.9 26.5 17.87 47.51 1.72 3.63-0.1 16.99 2.24 20.9 2.39 4 7.19 0.39 11.75 2.08 4.26 1.59 8.24 8.45 11.51 12.52 5.2 6.46-1.54 28.67 4.42 35.58 8.16 9.47 4.05 39.01 13.49 48.28 3.76 3.69 8.43-2.83 12.43 0.6 5.72 4.9 17.56 12.78 21.35 19.42 2.76 4.85-2.74 8.67 1.64 11.97 7.32 5.5 9.42 27.64 16.84 32.44 3.04 1.96 0.69-6.33 8.41-0.84 5.68 4.04 3.43 15.89 7.3 21.06 5.85 7.8 19.16 23.36 23.89 30.4 10.61 15.8 4.65 39.4 4.65 47.67z";

    useEffect(() => {
        const onScroll = () => {
            if (!pathRef.current) return;
            const topPos = pathRef.current.getBoundingClientRect().top;
            const scrollPos = window.scrollY + window.innerHeight - 150;
            if (topPos < scrollPos) {
                setAnimated(true);
                window.removeEventListener("scroll", onScroll);
            }
        };

        const onResize = () => {
            const width = window.innerWidth;
            if (width < 600) {
                setPathWidth(24);
                setPointRadius(40);
                setFontSize(10);
            } else if (width < 1000) {
                setPathWidth(16);
                setPointRadius(50);
                setFontSize(14);
            } else {
                setPathWidth(16);
                setPointRadius(56);
                setFontSize(16);
            }
        };

        onResize();
        window.addEventListener("scroll", onScroll);
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
        }
    }, []);

    if (!race) return null;

    return (
        <Content dark={false}>
             <div className={styles.container}>
            <div className={styles.textSide}>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>

            <div className={styles.routeSide}>
                <svg className={styles.svg} viewBox="0 0 4050 709" fill="none">
                    <path d={AustraliaD} fill="#d9e1f2" stroke="#152242" strokeWidth={2}/>
                    <path ref={pathRef} d={race.pathD} className={`${styles.path} ${animated ? styles.pathAnimation : ""}`} stroke="#3a486a" strokeWidth={pathWidth} strokeLineCap="round" strokeLineJoin="round"/>
                    {race.checkpoints?.map((point, i) => (
                        <circle key={i} cx={point.x} cy={point.y} r={pointRadius} className={`${styles.point} ${animated ? styles.pointAnimation : ""}`}/>
                    ))}
                </svg>

                {race.checkpoints?.map((point, i) => (
                    <div key={i} className={`${styles.step} ${animated ? styles.stepAnimation : ""}`} style={{ top: (point.label?.[0] ?? 50) + "%", left: (point.label?.[1] ?? 50) + "%", fontSize }}>
                        {point.name}
                    </div>
                ))}
            </div>
        </div>
        </Content>
       
    );
}