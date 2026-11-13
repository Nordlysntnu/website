import Head from 'next/head';
import Content from '@shared/components/Content';
import Layout from '@shared/components/Layout';
import PageHeader from '@shared/components/PageHeader';
import AdoptPicker from '@features/adopt/AdoptPicker';
import styles from '@features/adopt/styles/AdoptPage.module.css';

const steps = [
    ['Choose your panels', 'Click the panels you like on the car, or let us pick them for you.'],
    ['Pay with Vipps', 'One panel costs 100 kr, and bundles give you more panels for less.'],
    ['See your name on the car', 'Your name, if you add one, appears on your panels on this page.'],
];

export default function Adopt() {
    return (
        <>
            <Head>
                <title>Adopt a solar panel · Nordlys</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout current="Adopt">
                <></>
                <PageHeader title="Adopt" />
                <Content dark={true}>
                    <div className={styles.intro}>
                        <div>
                            <p className={styles.eyebrow}>Support Nordlys</p>
                            <h2 className={styles.title}>Adopt a solar panel on our car</h2>
                        </div>
                        <p className={styles.lead}>
                            Every solar panel on the car can be adopted. Choose your panels, add your name if you like,
                            and pay with Vipps. Your support helps us build Norway&apos;s next solar race car.
                        </p>
                    </div>
                    <ol className={styles.steps}>
                        {steps.map(([title, text], index) => (
                            <li key={title} className={styles.step}>
                                <span className={styles.number} aria-hidden="true">{index + 1}</span>
                                <div>
                                    <h3 className={styles.stepTitle}>{title}</h3>
                                    <p className={styles.stepText}>{text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </Content>
                <Content dark={false}>
                    <AdoptPicker />
                </Content>
            </Layout>
        </>
    );
}
