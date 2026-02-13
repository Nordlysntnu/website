import Head from 'next/head';
import Content from '@shared/components/Content';
import Groups from '@features/team/Groups';
import JoinForm from '@features/join/JoinForm';
import Layout from '@shared/components/Layout';
import PageHeader from '@shared/components/PageHeader';
import PartHeader from '@shared/components/PartHeader';
import AlertPane from '@features/alert/AlertPane';

import { MarkdownGroupParser } from '@features/join/MarkdownGroupParser';

import Mechanical from '@assets/symbols-and-logos/Mechanical.png';
import Chassis from '@assets/symbols-and-logos/Chassis.png';
import Software from '@assets/symbols-and-logos/Software.png';
import EmbeddedElectronics from '@assets/symbols-and-logos/EmbeddedElectronics.png';
import Marketing from '@assets/symbols-and-logos/Marketing.png';
import Logistics from '@assets/symbols-and-logos/Logistics.png';
import Management from '@assets/symbols-and-logos/Management.png';

export async function getStaticProps() {
  const imageMap = {
    electrical: EmbeddedElectronics.src,
    mechanical: Mechanical.src,
    chassis: Chassis.src,
    software: Software.src,
    marketing: Marketing.src,
    logistics: Logistics.src,
    finance: Management.src,
    board: Management.src
  };

  const groups = await MarkdownGroupParser("src/markdown/board_and_leaders_2026.md", imageMap);

  return { props: { groups } };
}


export default function Join({ groups }) {
  const text = <>Do you want to join Nordlys and take part in the development of Norways first Solar Racing Car and drive the world towards a sustainable future? We accept both normal students, and students who want to write their thesis on the project. See our suggested project subjects under, or suggest your own thesis. <br /><br />NB! <em>You have to apply for your bachelor's or master's thesis through NTNU as well, but by applying here, you may reserve a subject.</em></>;

  return (
    <>
      <Head>
        <title>Nordlys</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout current="Join">
        <></>

        <AlertPane />
        
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
