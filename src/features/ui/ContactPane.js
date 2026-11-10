import { useRef, useState } from 'react';
import styles from './styles/ContactPane.module.css';

export default function ContactPane() {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbzyycGbOVZH4fypAoCzVYLhGT3YFcYidSFkc2sQMMBzyJUJW3T60_1XdspOeuqY5a-HmA/exec"
    const [loading, setLoading] = useState(false)
    const formRef = useRef(null)

    const [show, setShow] = useState('none')


    const [errors, setErrors] = useState({})
    const [formError, setFormError] = useState("")

    function handleValidation() {
       const form = formRef.current
       let newErrors = {}

       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

       if (!form.email?.value?.trim()) {
        newErrors.email = "Email is required"
       } else if (!emailRegex.test(form.email?.value?.trim())) {
        newErrors.email = "Please input a valid email address"
       }

       if (!form.message?.value?.trim()) {
        newErrors.message = "A message is required"
       }

       setErrors(newErrors)

       if (Object.keys(newErrors).length > 0) {
        setFormError("");
        setTimeout(() => setFormError("Please fill in all required fields"))
        return false
       }

       setFormError("")

       return true
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!handleValidation()) {
            return
        }

        if (process.env.NEXT_PUBLIC_LOCAL_PREVIEW === 'true') {
            setShow('local');
            return;
        }
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
            email: formRef.current.email.value,
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
            if (data['result'] == 'error') {
                throw Error('Not successfull')
            }
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
        <form className={styles.form} ref={formRef} onSubmit={handleSubmit} noValidate>
            <div className={`${styles.field} ${styles.wide}`}>
                <label className={styles.labelRequired} htmlFor="contact-email">Email</label>
                <input className={styles.input} type="email" id="contact-email" name="email" placeholder="ola.nordmann@example.com" autoComplete="email"
                    aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'contact-email-error' : undefined} />
                {errors.email && <div id="contact-email-error" className={styles.errorText}>{errors.email}</div>}
            </div>
            <div className={styles.field}>
                <label className={styles.label} htmlFor="contact-first">First name</label>
                <input className={styles.input} type="text" id="contact-first" name="first" placeholder="Ola" autoComplete="given-name" />
            </div>
            <div className={styles.field}>
                <label className={styles.label} htmlFor="contact-last">Last name</label>
                <input className={styles.input} type="text" id="contact-last" name="last" placeholder="Nordmann" autoComplete="family-name" />
            </div>
            <div className={`${styles.field} ${styles.wide}`}>
                <label className={styles.label} htmlFor="contact-topic">Topic</label>
                <input className={styles.input} type="text" id="contact-topic" name="topic" placeholder="Sponsorship, joining, press …" />
            </div>
            <div className={`${styles.field} ${styles.wide}`}>
                <label className={styles.labelRequired} htmlFor="contact-message">Message</label>
                <textarea className={`${styles.input} ${styles.message}`} id="contact-message" name="message" placeholder="Write your message here"
                    aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? 'contact-message-error' : undefined} />
                {errors.message && <div id="contact-message-error" className={styles.errorText}>{errors.message}</div>}
            </div>
            <div className={`${styles.actions} ${styles.wide}`}>
                <button className={styles.submit} disabled={loading}>{loading ? 'Sending…' : 'Send message'}</button>
                <div role="status" aria-live="polite">
                    {show === 'error' && <p className={styles.error}><span className={styles.icon}>!</span>Something went wrong. Please try again.</p>}
                    {show === 'success' && <p className={styles.success}><span className={styles.icon}>&#10003;</span>Thanks! Your message was sent.</p>}
                    {show === 'local' && <p className={styles.note}>Local test complete — nothing was sent.</p>}
                    {formError && <p className={styles.errorText}>{formError}</p>}
                </div>
            </div>
        </form>
    )
}