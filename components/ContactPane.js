import { useRef, useState } from 'react';
import styles from '../styles/ContactPane.module.css';

export default function ContactPane() {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbzyycGbOVZH4fypAoCzVYLhGT3YFcYidSFkc2sQMMBzyJUJW3T60_1XdspOeuqY5a-HmA/exec"
    const [loading, setLoading] = useState(false)
    const formRef = useRef(null)

    const [show, setShow] = useState('none')

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        setShow("none")

        const today = new Date()

        const year = today.getFullYear()
        const month = today.getMonth() + 1
        const date = today.getDate()
        const hours = today.getHours()
        const minutes = today.getMinutes()

        const currentDate = date + "." + month + "." + year
        const currentTime = "kl. " + hours + "." + minutes
        const currentDateTime = currentDate + " " + currentTime

        const rawData = {
            from: formRef.current.from.value,
            first: formRef.current.first.value,
            last: formRef.current.last.value,
            topic: formRef.current.topic.value,
            message: formRef.current.message.value,
            time: currentDateTime
        }

        console.log(rawData)

        const formData = new FormData()

        Object.keys(rawData).forEach(key => formData.append(key, rawData[key]));

        fetch(scriptUrl, {method: 'POST', body: formData})
        .then(res => res.json()).then(data => {
            console.log(data)
            console.log("Successfully submitted")
            formRef.current.reset()
            setLoading(false)
            setShow("success")
        })
        .catch(err => {
            console.log(err)
            setLoading(false)
            setShow("error")
        })
    }

    return (
        <div className={styles.container}>
            <p className={styles.textContainer}>Do you want to come in contact with us? The easiest way is to fill in the form!</p>
            <div className={styles.vertLine}></div>
            <form className={styles.formContainer} ref={formRef} onSubmit={handleSubmit}>
                <label className={styles.label} htmlFor="from">From:</label>
                <input className={styles.input} type="text" id={styles.from} name="from" placeholder='example@example.com' />
                <input className={styles.input} type="text" id={styles.first} name="first" placeholder='Ola' />
                <input className={styles.input} type="text" id={styles.last} name="last" placeholder='Nordmann' />
                <label className={styles.label} htmlFor="topic">Topic:</label>
                <input className={styles.input} type="text" id={styles.topic} name="topic" placeholder='Topic' />
                <label className={styles.label} htmlFor="message">Message:</label>
                <textarea className={styles.input} id={styles.message} name="message" placeholder="Write your message here" />
                <button className={styles.submit}>{loading ? "Loading..." : "Submit"}</button>
                <label className={styles.error} style={{display: (show === "error")? "inline-block" : "none"}}><span className={styles.icon}>!</span>Something went wrong. Please try again</label>
                <label className={styles.success} style={{display: (show === "success")? "inline-block" : "none"}}><span className={styles.icon}>&#10003;</span>Success</label>
            </form>
        </div>
    )
}