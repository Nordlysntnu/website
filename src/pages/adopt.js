import Head from 'next/head';
import Content from '@shared/components/Content';
import Layout from '@shared/components/Layout';
import PageHeader from '@shared/components/PageHeader';
import AdoptPicker from '@features/adopt/AdoptPicker';
import { PREVIEW } from '@features/adopt/api';
import { TEXT } from '@features/adopt/text.mjs';
import useAdoptLanguage from '@features/adopt/useAdoptLanguage';
import styles from '@features/adopt/styles/AdoptPage.module.css';

export default function Adopt() {
    // Norwegian for Norwegian browsers, English for everyone else; see text.mjs.
    const [language, setLanguage] = useAdoptLanguage();
    const text = TEXT[language];
    const other = language === 'nb' ? 'en' : 'nb';

    return (
        <>
            <Head>
                <title>{text.page.title}</title>
                <link rel="icon" href="/favicon.ico" />
                {/* Preview page: not linked from the site and kept out of search engines until launch. */}
                {PREVIEW && <meta name="robots" content="noindex, nofollow" />}
            </Head>
            <Layout current="Adopt">
                <></>
                <PageHeader title={text.page.header} />
                <Content dark={true}>
                    <div className={styles.toolbar}>
                        {PREVIEW && (
                            <p className={styles.preview}>
                                <strong>{text.page.previewLabel}</strong> {text.page.previewText}
                            </p>
                        )}
                        <button type="button" className={styles.language} lang={other} aria-label={text.page.switchLabel} onClick={() => setLanguage(other)}>
                            {text.page.switchTo}
                        </button>
                    </div>
                    <div className={styles.intro}>
                        <div>
                            <p className={styles.eyebrow}>{text.page.eyebrow}</p>
                            <h2 className={styles.title}>{text.page.heading}</h2>
                        </div>
                        <p className={styles.lead}>{text.page.lead}</p>
                    </div>
                    <ol className={styles.steps}>
                        {text.page.steps.map(([title, body], index) => (
                            <li key={index} className={styles.step}>
                                <span className={styles.number} aria-hidden="true">{index + 1}</span>
                                <div>
                                    <h3 className={styles.stepTitle}>{title}</h3>
                                    <p className={styles.stepText}>{body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </Content>
                <Content dark={false}>
                    <AdoptPicker text={text} />
                </Content>
            </Layout>
        </>
    );
}
