import { useState } from 'react';
import Head from 'next/head';
import Content from '@shared/components/Content';
import Layout from '@shared/components/Layout';
import PageHeader from '@shared/components/PageHeader';
import JoinIntro from '@features/join/JoinIntro';
import GroupCards from '@features/join/GroupCards';
import ApplySection from '@features/join/ApplySection';
import { toggleChoice } from '@features/join/choices';

import { MarkdownGroupParser } from '@features/join/MarkdownGroupParser';

import { groupIcons } from '@features/ui/groupIcons';

export async function getStaticProps() {
  const groups = await MarkdownGroupParser("src/markdown/join.md", groupIcons);

  return { props: { groups } };
}

export default function Join({ groups }) {
  // Chosen group keys in order of preference, shared by the group cards and the form.
  const [choices, setChoices] = useState([]);
  const onToggle = key => setChoices(current => toggleChoice(current, key));
  const onReset = () => setChoices([]);

  return (
    <>
      <Head>
        <title>Join · Nordlys</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout current="Join">
        <></>
        <PageHeader title="Join" />
        <Content dark={true}>
          <JoinIntro />
        </Content>
        <Content dark={false}>
          <GroupCards groups={groups} choices={choices} onToggle={onToggle} />
        </Content>
        <Content dark={true}>
          <ApplySection groups={groups} choices={choices} onToggle={onToggle} onReset={onReset} />
        </Content>
      </Layout>
    </>
  );
}
