import { useRef, useState } from 'react';
import styles from '../styles/JoinForm.module.css';

export default function JoinForm({ groups }) {
    const formRef = useRef(null)

    const [show, setShow] = useState("form")

    const [isThesis, setIsThesis] = useState(true);
    const [normalStyle, setNormalStyle] = useState(styles.choice);
    const [thesisStyle, setThesisStyle] = useState(`${styles.choice} ${styles.chosen}`);

    const [normalDisplay, setNormalDisplay] = useState("none")
    const [thesisDisplay, setThesisDisplay] = useState("block")

    const [chosen1, setChosen1] = useState("none")
    const [chosen2, setChosen2] = useState("none")
    const [chosen3, setChosen3] = useState("none")
    const [chosen4, setChosen4] = useState("none")

    const [thesisEditable, setThesisEditable] = useState(false)
    const thesisTextArea = useRef(null);
    const thesisChoiceArea = useRef(null);

    const [currentPage, setCurrentPage] = useState(0);
    const pageStyles = [`${styles.innerContainer} ${styles.subForm1}`, `${styles.innerContainer} ${styles.subForm2}`, `${styles.innerContainer} ${styles.subForm3}`]
    const [backButton, setBackButton] = useState(`${styles.disButton} ${styles.button}`)
    const [forwardButton, setForwardButton] = useState(`${styles.actButton} ${styles.button}`)
    const [lightOne, setLightOne] = useState(`${styles.light} ${styles.current}`)
    const [lightTwo, setLightTwo] = useState(`${styles.light}`)
    const [lightThree, setLightThree] = useState(`${styles.light}`)

    function getGroups() {
        return (
            <>
                <option value="none">None</option>
                {
                    Object.keys(groups).map((groupName, i) => (
                        <option value={groupName}>{groups[groupName].name}</option>
                    ))
                }
            </>
        )
    }

    function getChoices(groupChoice) {
        const theses = groups[groupChoice]

        if (!groupChoice || groupChoice === 'none' || groupChoice === 'suggest') {
            return <option value='none'>-</option>
        }

        return (
            <>
                <option value="any">Any</option>
                {
                    Object.keys(theses).map((thesisName, i) => {
                        if (thesisName != 'image' && thesisName != 'name') {
                            return <option value={thesisName}>{theses[thesisName].name}</option>
                        }
                    })
                }
            </>
        )
    }

    function chooseNormal() {
        if (isThesis) {
            setNormalStyle(`${styles.choice} ${styles.chosen}`)
            setThesisStyle(styles.choice)
            setThesisDisplay("none")
            setNormalDisplay("block")
            setIsThesis(false)
        }
    }

    function chooseThesis() {
        if (!isThesis) {
            setThesisStyle(`${styles.choice} ${styles.chosen}`)
            setNormalStyle(styles.choice)
            setNormalDisplay("none")
            setThesisDisplay("block")
            setIsThesis(true)
        }
    }

    function setThesisText(thesisChoice) {
        setThesisEditable(false)
        if (thesisChoice === "suggest" || thesisChoice === "any") {
            setThesisEditable(true)
            return ""
        } else if (thesisChoice === "none") {
            return ""
        } else {
            return groups[chosen4][thesisChoice].text + "\n\n" + "Supervisor: " + groups[chosen4][thesisChoice].supervisor
        }
    }

    function handleBack() {
        if (currentPage != 0) {
            setCurrentPage(currentPage - 1)
            setForwardButton(`${styles.actButton} ${styles.button}`)
        }

        if (currentPage - 1 == 0) {
            setBackButton(`${styles.disButton} ${styles.button}`)
        }

        handleChange(currentPage - 1)
    }

    function handleForward() {
        if (currentPage != 2) {
            setCurrentPage(currentPage + 1)
            setBackButton(`${styles.actButton} ${styles.button}`)
        }

        if (currentPage + 1 == 2) {
            setForwardButton(`${styles.disButton} ${styles.button}`)
        }

        handleChange(currentPage + 1)
    }

    function handleChange(index) {
        if (index == 0) {
            setLightOne(`${styles.light} ${styles.current}`)
            setLightTwo(`${styles.light}`)
            setLightThree(`${styles.light}`)
        } else if (index == 1) {
            setLightTwo(`${styles.light} ${styles.current}`)
            setLightOne(`${styles.light}`)
            setLightThree(`${styles.light}`)
        } else if (index == 2) {
            setLightThree(`${styles.light} ${styles.current}`)
            setLightOne(`${styles.light}`)
            setLightTwo(`${styles.light}`)
        }
    }

    function toForm() {
        setShow('form')
        setLightOne(`${styles.light} ${styles.current}`)
        setLightTwo(`${styles.light}`)
        setLightThree(`${styles.light}`)
        setForwardButton(`${styles.actButton} ${styles.button}`)
        setBackButton(`${styles.disButton} ${styles.button}`)
        setCurrentPage(0)
    }

    const [loading, setLoading] = useState(false)
    const scriptUrl = "https://script.google.com/macros/s/AKfycbwJFqPV2HZmQLryKuMnC_zBm6OjtUO6lZzQVkj1V9fPARKxPrL8fi5y8P2T3k_B6T1F/exec"

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)

        const rawData = {
            first: formRef.current.first.value,
            last: formRef.current.last.value,
            phone: formRef.current.phone.value,
            email: formRef.current.email.value,
            study: formRef.current.study.value,
            year: formRef.current.year.value,
            isThesis: isThesis? "Yes" : "No",
            group1: formRef.current.group1.value,
            position1: formRef.current.position1.value,
            group2: formRef.current.group2.value,
            position2: formRef.current.position2.value,
            group3: formRef.current.group3.value,
            position3: formRef.current.position3.value,
            group4: formRef.current.group4.value,
            position4: formRef.current.position4.value,
            thesis: formRef.current.thesis.value,
            description: formRef.current.description.value
        }

        const formData = new FormData()

        Object.keys(rawData).forEach(key => formData.append(key, rawData[key]));

        fetch(scriptUrl, {method: 'POST', body: formData})
        .then(res => res.json()).then(data => {
            console.log("Successfully submitted")
            formRef.current.reset()
            setLoading(false)
            setShow('success')
        })
        .catch(err => {
            console.log(err)
            setLoading(false)
            setShow('error')
        })
    }

    return (
        <center>
            <div className={styles.around}>
                <form className={styles.container} ref={formRef} onSubmit={handleSubmit} style={{display: (show === "form")? "block" : "none"}}>
                    <h2 className={styles.title}>Application form</h2>
                    <div className={pageStyles[currentPage]}>
                        <div className={styles.subForm}>
                            <label className={styles.label} htmlFor="first">First name:</label>
                            <input className={styles.input} type="text" id={styles.first} name="first" placeholder='Ola' />
                            <label className={styles.label} htmlFor="last">Last name:</label>
                            <input className={styles.input} type="text" id={styles.last} name="last" placeholder='Nordmann' />
                            <label className={styles.label} htmlFor="contact">Contact information:</label>
                            <input className={styles.input} type="text" id={styles.phone} name="phone" placeholder='+47 123 45 678' />
                            <input className={styles.input} type="email" id={styles.email} name="email" placeholder='example@example.com' />
                            <label className={styles.label} htmlFor="study">Field of study:</label>
                            <input className={styles.input} type="text" id={styles.study} name="study" placeholder='Energi og Miljø' />
                            <select className={styles.input} name="year" id={styles.year}>
                                <option value="1">1st</option>
                                <option value="2">2nd</option>
                                <option value="3">3rd</option>
                                <option value="4">4th</option>
                                <option value="5">5th</option>
                            </select>
                        </div>
                        <div className={styles.subForm}>
                            <div className={styles.chooseContainer}>
                                <div>
                                    <div className={normalStyle} onClick={chooseNormal}>
                                        Normal
                                    </div>
                                    <div className={thesisStyle} onClick={chooseThesis}>
                                        Thesis
                                    </div>
                                </div>
                                <div className={styles.formContainer}>
                                    <div style={{display: normalDisplay}}>
                                        <label className={styles.label} htmlFor="field">First choice:</label>
                                        <select className={styles.input} name="group1" onChange={(e) => {setChosen1(e.target.value)}} id={styles.group}>
                                            {getGroups()}
                                        </select>
                                        <select className={styles.input} name="position1" id={styles.position}>
                                            {getChoices(chosen1)}
                                        </select>
                                        <label className={styles.label} htmlFor="field">Second choice:</label>
                                        <select className={styles.input} name="group2" onChange={(e) => {setChosen2(e.target.value)}} id={styles.group}>
                                            {getGroups()}
                                        </select>
                                        <select className={styles.input} name="position2" id={styles.position}>
                                            {getChoices(chosen2)}
                                        </select>
                                        <label className={styles.label} htmlFor="field">Third choice:</label>
                                        <select className={styles.input} name="group3" onChange={(e) => {setChosen3(e.target.value)}} id={styles.group}>
                                            {getGroups()}
                                        </select>
                                        <select className={styles.input} name="position3" id={styles.position}>
                                            {getChoices(chosen3)}
                                        </select>
                                    </div>
                                    <div style={{display: thesisDisplay}}>
                                        <label className={styles.label} htmlFor="field">Choose project thesis:</label>
                                        <select className={styles.input} name="group4" onChange={(e) => {setChosen4(e.target.value); thesisChoiceArea.current.selectedIndex = 0; thesisTextArea.current.value = ""; if (e.target.value === 'none') {thesisTextArea.current.value = setThesisText('none')} else if (e.target.value === 'suggest') {thesisTextArea.current.calue = setThesisText('suggest')} else {thesisTextArea.current.calue = setThesisText('any')}}} id={styles.group}>
                                            {getGroups()}
                                            <option value="suggest">Suggest</option>
                                        </select>
                                        <select className={styles.input} name="position4" ref={thesisChoiceArea} onChange={(e) => {thesisTextArea.current.value = setThesisText(e.target.value)}} id={styles.position}>
                                            {getChoices(chosen4)}
                                        </select>
                                        <textarea className={styles.input} ref={thesisTextArea} disabled={!thesisEditable} id={styles.thesis} name="thesis" placeholder='Suggest thesis' />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.subForm}>
                            <label className={styles.label} htmlFor="field">Tell us about yourself in a few words:</label>
                            <textarea className={styles.input} id={styles.description} name="description" placeholder="Something about yourself" />
                            <center><button className={styles.submit}>{loading ? "Loading..." : "Submit"}</button></center>
                        </div>
                    </div>
                    <center>
                        <div className={`${styles.bottomContainer}`}>
                            <div className={backButton} onClick={handleBack}>
                                &#60;
                            </div>
                            <div className={lightOne}></div>
                            <div className={lightTwo}></div>
                            <div className={lightThree}> </div>
                            <div className={forwardButton} onClick={handleForward}>
                                &#62;
                            </div>
                        </div>
                    </center>
                </form>
                <div className={styles.error} style={{display: (show === "error")? "block" : "none"}}>
                    <div className={styles.errorIcon}>!</div>
                    <div className={styles.text}>Something went wrong. Please try again later.</div>
                    <button className={styles.submit} onClick={toForm}>Back to form</button>
                </div>
                <div className={styles.success} style={{display: (show === "success")? "block" : "none"}}>
                    <div className={styles.successIcon}>&#10003;</div>
                    <div className={styles.text}>Success! Your application has been delivered. You will be contacted in a few days with further information.</div>
                    <button className={styles.submit} onClick={toForm}>Back to form</button>
                </div>
            </div>
        </center>
    )
}