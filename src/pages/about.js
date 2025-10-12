import Head from 'next/head';
import Layout from '@shared/components/Layout';
import Mission from '@features/about/Mission';
import PageHeader from '@shared/components/PageHeader';
import Route from '@features/about/Route';
import SubPartVideo from '@shared/components/SubPartVideo';
import SubPart1 from '@shared/components/SubPart1';

export default function About() {
  return (
      <>
      <Head>
        <title>Nordlys</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout current="About">
        <></>
        <PageHeader title="About us" />
        <Mission dark={true} />
        <SubPartVideo dark={false} video="/videos/AboutVideo.mp4" link="https://www.youtube.com/watch?v=R_lVdrHnbYo" linkText="Watch more" poster="/posters/compressed/AboutVideo.png" title="Solar Racing" text="To solve the problems of tomorrow, nothing is more important than thinking new. Solar racing pushes the limit of technology and solar energy innovation through competition. Who can drive the fastest and get to the finish line before running out of energy?" />
        <Route dark={true} />
      </Layout>
    </>
  )
}