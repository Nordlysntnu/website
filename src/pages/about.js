import Head from 'next/head';
import Layout from '@shared/components/Layout';
import Mission from '@features/about/Mission';
import PageHeader from '@shared/components/PageHeader';
import Route from '@features/about/Route';
import SubPartVideo from '@shared/components/SubPartVideo';
import SubPart1 from '@shared/components/SubPart1';
import FAQSection from '@features/about/FAQ';

import fs from "fs";
import path from "path";
import { MarkdownToHtml } from "@shared/utils/MarkdownToHtml";
import { MarkdownToFAQHtml } from '@features/about/MarkdownToFAQHtml';

export default function About({ missionHtml, faqData }) {
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
        <FAQSection faqData={faqData} />
      </Layout>
    </>
  )
}

export async function getStaticProps() {
  const aboutFilePath = path.join(process.cwd(), "src/markdown/about.md");
  const faqFilePath = path.join(process.cwd(), "src/markdown/faq.md");

  const aboutMdContent = fs.readFileSync(aboutFilePath, "utf8");
  const faqMdContent = fs.readFileSync(faqFilePath, "utf8");

  const aboutHtmlContent = await MarkdownToHtml(aboutMdContent);
  const faqData = await MarkdownToFAQHtml(faqMdContent);

  return { props: { missionHtml: aboutHtmlContent, faqData }};
}
