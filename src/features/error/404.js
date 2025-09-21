import Head from 'next/head';
import Link from 'next/link';
import Content from '@shared/components/Content';
import Layout from '@shared/components/Layout';
import PageLanding from '@shared/components/PageLanding';
import LandingImage from '@assets/other/Stars.png';
import styles from './styles/404.module.css';

export default function PageNotFound() {
    return(
        <>
        <Head>
          <title>Nordlys</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Layout current="">
            <PageLanding title="Page not found :/" text="This website is not finished, and the page you searched for may be under development" image={LandingImage.src} />
            <Content dark={true}>
                <div className={styles.container}>
                    <Link className={styles.link} href="/">Back to home</Link>
                </div>
            </Content>
        </Layout>
      </>
    )
}