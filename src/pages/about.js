import Head from 'next/head';
import Layout from '@shared/components/Layout';
import Mission from '@features/about/Mission';
import PageHeader from '@shared/components/PageHeader';
import Route from '@features/about/Route';
import SubPartVideo from '@shared/components/SubPartVideo';
import SubPart1 from '@shared/components/SubPart1';
import Competitions from '@features/about/Competitions';
import FAQSection from '@features/about/FAQ';

import fs from "fs";
import path from "path";
import { MarkdownToHtml } from "@shared/utils/MarkdownToHtml";

//TODO: add pictures or something on the right of comp info
export default function About({ missionHtml, competitionsHtml, faqHtml }) {
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
        <Competitions dark={true} htmlContent={competitionsHtml} />
        <Route dark={false} />
        <FAQSection htmlContent={faqHtml} />
      </Layout>
    </>
  )
}

export async function getStaticProps() {
  const missionPath = path.join(process.cwd(), "src/markdown/about.md");
  const competitionsPath = path.join(process.cwd(), "src/markdown/competitions.md");

  const missionMd = fs.readFileSync(missionPath, "utf8");
  const competitionsMd = fs.readFileSync(competitionsPath, "utf8");

  const missionHtml = await MarkdownToHtml(missionMd);
  const competitionsHtml = await MarkdownToHtml(competitionsMd);

  return { props: {missionHtml, competitionsHtml }};
}
