import Head from 'next/head';
import Landing from '@shared/components/Landing';
import Layout from '@shared/components/Layout';
import SubPart1 from '@shared/components/SubPart1';
import GoalPane from '@features/home/GoalPane';
import Disciplines from '@features/home/Disciplines';
import MemberPresentation from '@features/team/MemberPresentation';
import SubPartVideo from '@shared/components/SubPartVideo';
import AlertPane from '@features/alert/AlertPane';
import BlogPreview from '@features/home/BlogPreview';

export default function Home() {
  const text1 = "Theres nothing more valuable than creating something new. Through developing solar powered cars and competing in some of the worlds biggest solar racing competitions, Nordlys NTNU aims to educate the best engineers in Norway, and showcase optimism and innovation in a world in dire need of sustainable energies."
  const text2 = "One of the many contributers to solving global warming, is the increased usage of solar technology. The sun emits immense amounts of energy, free of charge. Finding innovative ways to use solar energy, such as in homes, on infrastructure, or even in cars, is key to move towards a sustainable future."

  /* <MemberPresentation dark={false} /> */
  /*<AlertPane />*/
  return (
    <>
      <Head>
        <title>Nordlys</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout current="Home">
        <Landing />
        <GoalPane dark={false} />
        <SubPart1 dark={true} image="/images/compressed/LandingImage.jpg" title="The impact of creating" text={text1} link="/about" linkText="About us" />
	<BlogPreview/>
        <Disciplines dark={true} />
        <SubPartVideo dark={false} video="/videos/compressed/SolarVideo.mp4" poster="/posters/compressed/SolarPanels.png" title="Solar Technology" text={text2} link="/about" linkText="About us" />
      </Layout>
    </>
  )
}
