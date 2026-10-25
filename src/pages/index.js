import Head from 'next/head';
import Landing from '@shared/components/Landing';
import Layout from '@shared/components/Layout';
import GoalPane from '@features/home/GoalPane';
import HomeStory from '@features/home/HomeStory';
import BlogPreview from '@features/home/BlogPreview';
import Disciplines from '@features/home/Disciplines';
import styles from '@features/home/styles/Home.module.css';

export default function Home() {
    return (
        <div className={styles.home}>
            <Head>
                <title>Nordlys</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <a className={styles.skipLink} href="#home-content">Skip to content</a>
            <Layout current="Home">
                <Landing />
                <GoalPane />
                <HomeStory />
                <BlogPreview />
                <Disciplines dark={true} />
            </Layout>
        </div>
    );
}
