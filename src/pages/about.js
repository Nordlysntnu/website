import Head from 'next/head';
import Layout from '@shared/components/Layout';
import Mission from '@features/about/Mission';
import PageHeader from '@shared/components/PageHeader';
import Route from '@features/about/Route';
import SubPartVideo from '@shared/components/SubPartVideo';
import Competitions from '@features/about/Competitions';
import FAQSection from '@features/about/FAQ';

import fs from "fs";
import path from "path";
import { MarkdownToHtml } from "@shared/utils/MarkdownToHtml";
import { MarkdownToFAQHtml } from '@features/about/utils/MarkdownToFAQHtml';
import { MarkdownToCompetitions } from '@features/about/utils/MarkdownToCompetitionHtml';

export default function About({ aboutHtmlContent, competitionsData, faqData }) {
  return (
      <>
      <Head>
        <title>Nordlys</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout current="About">
        <></>
        <PageHeader title="About us" />
        <Mission dark={true} htmlContent={aboutHtmlContent} />
        <FAQSection htmlContent={faqData} dark={false} />
        <SubPartVideo dark={true} video="/videos/compressed/AboutVideo.mp4" link="https://www.youtube.com/watch?v=R_lVdrHnbYo" linkText="Watch more" poster="/posters/compressed/AboutVideo.png" title="Solar Racing" text="To solve the problems of tomorrow, nothing is more important than thinking new. Solar racing pushes the limit of technology and solar energy innovation through competition. Who can drive the fastest and get to the finish line before running out of energy?" />
        <Competitions dark={true} introHtml={competitionsData.introHtml} competitions={competitionsData.competitions} />
        <Route dark={false} />
      </Layout>
    </>
  )
}

export async function getStaticProps() {
  const aboutFilePath = path.join(process.cwd(), "src/markdown/about.md");
  const competitionsPath = path.join(process.cwd(), "src/markdown/competitions.md");
  const faqFilePath = path.join(process.cwd(), "src/markdown/faq.md");

  const aboutMdContent = fs.readFileSync(aboutFilePath, "utf8");
  const competitionsMdContent = fs.readFileSync(competitionsPath, "utf8");
  const faqMdContent = fs.readFileSync(faqFilePath, "utf8");

  const aboutHtmlContent = await MarkdownToHtml(aboutMdContent);
  const competitionsData = await MarkdownToCompetitions(competitionsMdContent);
  const faqData = await MarkdownToFAQHtml(faqMdContent);

  return { props: {aboutHtmlContent, competitionsData, faqData }};
}
