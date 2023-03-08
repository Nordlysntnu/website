import Head from 'next/head';
import Landing from '../components/Landing';
import Layout from '../components/Layout';
import SubPart1 from '../components/SubPart1';
import LandingImage from '../public/LandingImage.jpg';
import GoalPane from '../components/GoalPane';
import Disciplines from '../components/Disciplines';
import MemberPresentation from '../components/MemberPresentation';
import SubPartVideo from '../components/SubPartVideo';

export default function Home() {
  const text1 = "Theres nothing more valuable than creating something new. Through developing solar powered cars and competing in some of the worlds biggest solar racing competitions, Nordlys NTNU aims to educate the best engineers in Norway, and showcase optimism and innovation in a world in dire need of sustainable energies."
  const text2 = "One of the many contributers to solving global warming, is the increased usage of solar technology. The sun emits immense amounts of energy, free of charge. Finding innovative ways to use solar energy, such as in homes, on infrastructure, or even in cars, is key to move towards a sustainable future."

  return (
    <>
      <Head>
        <title>Nordlys</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout current="Home">
        <Landing />
        <GoalPane dark={true} />
        <SubPart1 dark={false} image={LandingImage.src} title="The impact of creating" text={text1} link="/about" linkText="About us" />
        <MemberPresentation dark={true} />
        <Disciplines dark={false} />
        <SubPartVideo dark={true} video="SolarVideo.mp4" poster="SolarPanels.png" title="Solar Technology" text={text2} link="/about" linkText="About us" />
      </Layout>
    </>
  )
}
