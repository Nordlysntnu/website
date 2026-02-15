import Head from 'next/head';
import Landing from '@shared/components/Landing';
import Layout from '@shared/components/Layout';
import SubPart1 from '@shared/components/SubPart1';
import GoalPane from '@features/home/GoalPane';
import Disciplines from '@features/home/Disciplines';
import MemberPresentation from '@features/team/MemberPresentation';
import SubPartVideo from '@shared/components/SubPartVideo';
import AlertPane from '@features/alert/AlertPane';
import Alert from '@features/alert/Alert';
import BlogPreview from '@features/home/BlogPreview';
import { useState } from 'react';

export default function Home() {
  const text1 = "Theres nothing more valuable than creating something new. Through developing solar powered cars and competing in some of the worlds biggest solar racing competitions, Nordlys NTNU aims to educate the best engineers in Norway, and showcase optimism and innovation in a world in dire need of sustainable energies."
  const text2 = "One of the many contributers to solving global warming, is the increased usage of solar technology. The sun emits immense amounts of energy, free of charge. Finding innovative ways to use solar energy, such as in homes, on infrastructure, or even in cars, is key to move towards a sustainable future."

  const boardRecruitmentMessage = {
            name: "We are recruiting Group Leaders and Board members",
            info: "",
            description: <><p>Nordlys NTNU is recruiting to all Board and Group Leader Positions. Send us a mail or find us on stand to have a chat or send in an application below. You may also send an open application for positions which we are not currently recruiting! <br/><br/> <b>Application deadline:</b> March 1. <br/><br/></p></>,
            link: "join/#applicationForm",
            linkText: "Apply now!"}

  const [visiblePopup, setVisiblePopup] = useState(true)

  const closeAlert = () => {
      setVisiblePopup(false);
  };
    
  return (
    <>
      <Head>
        <title>Nordlys</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout current="Home" nosome={true}>
        <Landing />
        <div style={{position: 'fixed', bottom: 16, right: 16, zIndex: 2000}}>{visiblePopup && <Alert alert={boardRecruitmentMessage} onClose = {closeAlert}/>}</div>  
        <GoalPane dark={false} />
        <SubPart1 dark={true} image="/images/compressed/LandingImage.jpg" title="The impact of creating" text={text1} link="/about" linkText="About us" />
	      <BlogPreview/>
        <Disciplines dark={true} />
      </Layout>
    </>
  )
}
