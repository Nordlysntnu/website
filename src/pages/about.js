import Head from 'next/head';
import Layout from '@shared/components/Layout';
import Mission from '@features/about/Mission';
import PageHeader from '@shared/components/PageHeader';
import Route from '@features/about/Route';
import SubPartVideo from '@shared/components/SubPartVideo';
import SubPart1 from '@shared/components/SubPart1';
import { raceData } from '@features/about/BWSC';
import RouteVisualizer from '@features/about/RouteVisualizer';

import fs from "fs";
import path from "path";
import { MarkdownToHtml } from "@shared/utils/MarkdownToHtml";

export default function About({ missionHtml }) {
  return (
      <>
      <Head>
        <title>Nordlys</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout current="About">
        <></>
        <PageHeader title="About us" />
        <Mission dark={true} htmlContent={missionHtml} />
        <SubPartVideo dark={false} video="/videos/compressed/AboutVideo.mp4" link="https://www.youtube.com/watch?v=R_lVdrHnbYo" linkText="Watch more" poster="/posters/compressed/AboutVideo.png" title="Solar Racing" text="To solve the problems of tomorrow, nothing is more important than thinking new. Solar racing pushes the limit of technology and solar energy innovation through competition. Who can drive the fastest and get to the finish line before running out of energy?" />
        <Route dark={true} />
        <RouteVisualizer race={raceData} title="Bridgestone World Solar Challenge" description="The BWSC is a 3,022 km race across Australia from Darwin to Adelaide. Teams compete to build the most efficient solar-powered vehicles. Our solar car navigates harsh outback terrain while demonstrating cutting-edge sustainable technology."/>
      </Layout>
    </>
  )
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "src/markdown/about.md");
  const mdContent = fs.readFileSync(filePath, "utf8");
  const htmlContent = await MarkdownToHtml(mdContent);

  return { props: {missionHtml: htmlContent }};
}
