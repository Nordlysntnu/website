import Head from 'next/head';
import { localBlogProps } from '@features/cms/local-posts.mjs';
import Landing from '@shared/components/Landing';
import Layout from '@shared/components/Layout';
import GoalPane from '@features/home/GoalPane';
import HomeStory from '@features/home/HomeStory';
import BlogPreview from '@features/home/BlogPreview';
import Disciplines from '@features/home/Disciplines';
import styles from '@features/home/styles/Home.module.css';

export async function getStaticProps() {
    return { props: await localBlogProps() };
}

export default function Home({ cmsPosts = null, cmsError = null }) {
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
                <BlogPreview cmsPosts={cmsPosts} cmsError={cmsError} />
                <Disciplines dark={true} />
            </Layout>
        </div>
    );
}
