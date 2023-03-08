import Content from "./Content";
import styles from '../styles/Route.module.css';
import "animate.css/animate.min.css";
import { useEffect, useRef, useState } from "react";
import { AnimationOnScroll } from "react-animation-on-scroll";

export default function Route({ dark }) {
    const path = useRef(null)
    const [pathStyle, setPathStyle] = useState(`${styles.path}`)
    const [pointStyleOne, setPointStyleOne] = useState(`${styles.pointStyleOne}`)
    const [pointStyleTwo, setPointStyleTwo] = useState(`${styles.pointStyleTwo}`)
    const [pointStyleThree, setPointStyleThree] = useState(`${styles.pointStyleThree}`)
    const [pointRadius, setPointRadius] = useState('56.5')
    const [stepStyleOne, setStepStyleOne] = useState(`${styles.step}`)
    const [stepStyleTwo, setStepStyleTwo] = useState(`${styles.step}`)
    const [stepStyleThree, setStepStyleThree] = useState(`${styles.step}`)
    const [stepOnePos, setStepOnePos] = useState([75, 10])
    const [stepTwoPos, setStepTwoPos] = useState([50, 48])
    const [stepThreePos, setStepThreePos] = useState([78, 86])

    const [pathWidth, setPathWidth] = useState(24)
    const [fontSize, setFontSize] = useState(16)

    useEffect(() => {
        const topPos = path.current.getBoundingClientRect().top;
        function onScroll() {
            const scrollPos = window.scrollY + window.innerHeight - 150
            onResize()
            if (topPos < scrollPos) {
                setPathStyle(`${styles.path} ${styles.pathAnimation}`)
                setPointStyleOne(`${styles.pointStyleOne} ${styles.pointAnimationOne}`)
                setPointStyleTwo(`${styles.pointStyleTwo} ${styles.pointAnimationTwo}`)
                setPointStyleThree(`${styles.pointStyleThree} ${styles.pointAnimationThree}`)
                setStepStyleOne(`${styles.step} ${styles.stepAnimationOne}`)
                setStepStyleTwo(`${styles.step} ${styles.stepAnimationTwo}`)
                setStepStyleThree(`${styles.step} ${styles.stepAnimationThree}`)
                window.removeEventListener('scroll', onScroll)
            }
        }

        function onResize() {
            const width = window.innerWidth
            if (width < 400) {
                setPathWidth(40)
                setStepOnePos([0, 8])
                setStepTwoPos([38, 45])
                setStepThreePos([5, 70])
                setPointRadius(90)
                setFontSize(8)
            } else if (width < 600) {
                setPathWidth(32)
                setStepOnePos([5, 8])
                setStepTwoPos([44, 48])
                setStepThreePos([15, 73])
                setPointRadius(70)
                setFontSize(10)
            } else if (width < 750) {
                setPathWidth(24)
                setStepOnePos([11, 8])
                setStepTwoPos([46, 48])
                setStepThreePos([23, 75])
                setPointRadius(56.5)
                setFontSize(12)
            } else if (width < 1000) {
                setPathWidth(16)
                setStepOnePos([17, 8])
                setStepTwoPos([45, 48])
                setStepThreePos([25, 78])
                setPointRadius(56.5)
                setFontSize(14)
            } else {
                setPathWidth(16)
                setStepOnePos([20, 8])
                setStepTwoPos([45, 50])
                setStepThreePos([33, 80])
                setPointRadius(56.5)
                setFontSize(16)
            }
        }

        window.addEventListener('scroll', onScroll)
        window.addEventListener('resize', onResize)
    }, {once : true})

    return (
        <Content dark={dark}>
            <div className={styles.container}>
                <div className={styles.svgContainer}>
                    <svg className={styles.svg} viewBox="0 0 4050 709" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path ref={path} className={pathStyle} d="M43 588L147 555.522L227 474.767L313 512.511L417 588L509 512.511L589 345.733L668.5 415.517L754.5 555.522L877.5 512.511H1012L1153.5 415.517L1313 512.511H1380.5H1533.5C1558.17 526.848 1613.6 555.522 1638 555.522C1662.4 555.522 1766.83 526.848 1816 512.511L1926.5 415.517L2079.5 237.767L2196 114L2288 141.211C2308.67 173.396 2356.1 248.563 2380.5 291.75C2404.9 334.937 2509 345.733 2558 345.733L2662.5 291.75L2846.5 415.517L3122.5 474.767L3331 555.522L3497 512.511L3699 555.522L3736 512.511L3895.5 555.522H4006" stroke="#3a486a" stroke-width={pathWidth} stroke-linecap="round" stroke-linejoin="round"/>
                        <circle className={pointStyleOne} cx="500" cy="492.5" r={pointRadius} fill="white" stroke="#ff1053" stroke-width="20"/>
                        <circle className={pointStyleTwo} cx="2025" cy="284.5" r={pointRadius} fill="white" stroke="#ff1053" stroke-width="20"/>
                        <circle className={pointStyleThree} cx="3550" cy="516.5" r={pointRadius} fill="white" stroke="#ff1053" stroke-width="20"/>
                    </svg>
                    <div className={stepStyleOne} style={{top: stepOnePos[0] + '%', left: stepOnePos[1] + '%', fontSize: fontSize}}>
                        Concept
                    </div>
                    <div className={stepStyleTwo} style={{top: stepTwoPos[0] + '%', left: stepTwoPos[1] + '%', fontSize: fontSize}}>
                        Construction
                    </div>
                    <div className={stepStyleThree} style={{top: stepThreePos[0] + '%', left: stepThreePos[1] + '%', fontSize: fontSize}}>
                        Competition
                    </div>
                </div>
                <AnimationOnScroll animateIn="animate__fadeInUp" offset={50} delay={200} animateOnce>
                    <div className={styles.textContainer}>
                        The road to success and innovation is never straight forward. Our biannual projects are therefore modelled after sound engineering practices to streamline development and limit faults, containing concept development, design development, construction and testing. A lot of testing. 
                    </div>
                </AnimationOnScroll>
            </div>

        </Content>
    )
}