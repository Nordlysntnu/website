import Head from 'next/head';
import Layout from '@shared/components/Layout';
import Mission from '@features/about/Mission';
import PageHeader from '@shared/components/PageHeader';
import Route from '@features/about/Route';
import SolarRacingVideo from '@features/about/SolarRacingVideo';
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
        <SolarRacingVideo dark={false} />
        <FAQSection dark={true} faqData={faqData} />
        <Route dark={false} />
        <Competitions dark={true} introHtml={competitionsData.introHtml} competitions={competitionsData.competitions} />
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
