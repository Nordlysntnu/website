import Content from "@shared/components/Content";
import styles from "./styles/FAQ.module.css";
import { useState } from "react";

export default function FAQSection({ faqData }) {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <Content dark={true}>
            <div className={styles.container}>
                <h1>FAQs</h1>
      {faqData.map((item, index) => (
        <div key={index} className={styles.item}>
          
          <div
            className={styles.question}
            onClick={() => toggle(index)}
          >
            {item.question}
            <span className={styles.icon}>
              {openIndex === index ? "−" : "+"}
            </span>
          </div>

          <div
            className={`${styles.answer} ${
              openIndex === index ? styles.open : ""
            }`}
          >
            <div
              dangerouslySetInnerHTML={{ __html: item.answerHtml }}
            />
          </div>

        </div>
      ))}
    </div>
        </Content>
    
  );
}