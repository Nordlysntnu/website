import Head from 'next/head';
import Content from '@shared/components/Content';
import Groups from '@features/team/Groups';
import JoinForm from '@features/join/JoinForm';
import Layout from '@shared/components/Layout';
import PageHeader from '@shared/components/PageHeader';
import PartHeader from '@shared/components/PartHeader';

import { MarkdownGroupParser } from '@features/join/MarkdownGroupParser';

import { groupIcons } from '@features/ui/groupIcons';

export async function getStaticProps() {
  const groups = await MarkdownGroupParser("src/markdown/join.md", groupIcons);

  return { props: { groups } };
}


export default function Join({ groups }) {
  const text = <>Do you want to join Nordlys and help develop Norway's solar racing cars? We welcome students with different backgrounds and interests. Choose a group below and apply as a member; you do not need to choose a specialist position. Tell us what interests you and what you would like to learn. <br /><br />If you would like to explore a bachelor's or master's thesis with Nordlys, describe your idea in the application. <em>You must also apply for your thesis through NTNU.</em></>;

  return (
    <>
      <Head>
        <title>Nordlys</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout current="Join">
        <></>
        
        <PageHeader title="Join" />

        <Content dark={true}>
              <div id="applicationForm">
                <PartHeader darkColor={false} title="Apply" text={text} />
                <JoinForm groups={groups} />
              </div>
              <br></br>
              * The data you submit will be stored by Nordlys until the application is processed. The data will be stored no longer than six months.
          </Content>
      <Groups dark={false} groups={groups}/>
    </Layout>
        </>
  );
}
