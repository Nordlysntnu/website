import { useState, useRef } from "react";
import styles from "./styles/FAQ.module.css";
import Content from "@shared/components/Content"

export default function FAQSection({ dark, faqData = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Content dark={dark}>
        <h1>Frequently Asked Questions</h1>
        <div className={styles.faqAccordion}>
            {faqData.map((item, index) => {
                const contentRef = useRef(null);
                const isOpen = openIndex === index;
                return (
                    <div key={index} className={`${styles.accordionItem} ${isOpen ? styles.active : ""}`}>
                        <div className={styles.accordionHeader} onClick={() => toggle(index)}>
                            <div className={styles.accordionTitle}>{item.question}</div>
                            <div className={styles.accordionIcon}></div>
                        </div>
                        <div className={styles.accordionContent} style={{ height: isOpen ? contentRef.current?.scrollHeight : 0, }}>
                            <div ref={contentRef} dangerouslySetInnerHTML={{ __html: item.answerHtml }}/>
                        </div>
                    </div>
                );
            })}
        </div>

        <br></br>
        <br></br>
        <p>Still have unanswered questions? Feel free to contact us through the contact sheet on the bottom of the page!</p>
    </Content>
  );
}