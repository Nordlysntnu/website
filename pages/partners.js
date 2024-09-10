import Head from 'next/head';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Content from "../components/Content";
import Sponsors from "../components/Sponsors"
import Aneo from '../public/Partners/Aneo.svg';
import BrynAarflot from '../public/Partners/BrynAarflot.png';
import Equinor from '../public/Partners/Equinor.png';
import InterPersonell from '../public/Partners/InterPersonell.svg';
import Rejlers from '../public/Partners/Rejlers.png';
import Freber from '../public/Partners/Freber.png';
import Biesterfeld from '../public/Partners/Biesterfeld.png';
import Hydro from '../public/Partners/Hydro.png';
import Link from 'next/Link';
import styles from '../styles/partners.module.css';

export default function About() {
  const platinumSponsors = {
    'Aneo': {
        link: 'http://www.aneo.com',
        image: Aneo.src,
        description: <>Sustainability and renewable energy is in focus when Aneo contributes to the global energy transition by enabling the switch from fossil fuels. Aneo is a Nordic renewable group working to provide more renewable energy, electrification and energy efficency. With offices in Trondheim, Oslo, Bergen, Stavanger, Gjøvik and Stockholm, the company develops and implement renewable power projects ranging from industrial solar systems to electrical vehicle charging systems.<br /><br />Aneo is contributing to project 2025 by funding the on-board energy control systems of our solar car. Through their day-to-day expertise, Aneo is helping Nordlys get the most out of our high voltage components, without which the solar car would cease to drive.</>
    },
    'Bryn Aarflot': {
      link: 'https://baa.no/',
      image: BrynAarflot.src,
      description: <>Bryn Aarflot specializes in creating value through intellectual property (IP) law in Norway, featuring a team of top-tier patent attorneys and specialized IP lawyers. Recognized as a leading IP firm, they provide full-scale support from the initial ideation to the enforcement of IP rights. <br/><br/>The firm distinguishes itself by offering a comprehensive range of IP services. As platinum sponsors of Nordlys, Bryn Aarflot extends its commitment to IP value creation through educational workshops, equipping NTNU students with vital skills for their solar race project and professional futures.</>
    }
  }
  const goldSponsors = {
    'Equinor': {
        link: 'http://www.Equinor.com',
        image: Equinor.src,
        description: ""
    },
    'Rejlers': {
      link: "https://rejlers.no/",
      image: Rejlers.src,
      description: ""
    }
  }
  const silverSponsors = {
    'Freber': {
      link: "https://www.freber.no/",
      image: Freber.src,
      description: ""
    }

  }
  const bronzeSponsors = {
    'InterPersonell': {
        link: 'https://interpersonell.no/',
        image: InterPersonell.src,
        description: ""
    },
    'Biesterfeld': {
      link: 'https://biesterfeld.no/',
      image: Biesterfeld.src,
      description: ""
    },
    'Hydro': {
      link: 'https://www.hydro.com/no/no/',
      image: Hydro.src,
      description: ""
    }
  }
  return (
      <>
      <Head>
        <title>Nordlys</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout current="Partners">
        <></>
        <PageHeader title="Partners" />
            <Content dark={true}>
                As a volunteer student organization, we wouldn't be able to do anything without the great support from our sponsors. Either supporting us with components, expertise, services or money, we are very grateful for the trust and possibilities they give. Together we make history!
                <br />
                <br />
                Do you want to join us building Norway's first solar racing car? <Link href="/join" className={styles.link}>Contact us</Link>
            </Content>
            <Sponsors sponsors={platinumSponsors} title="Platinum Sponsors" dark={false} platinum={true} />
            <Sponsors sponsors={goldSponsors} title="Gold Sponsors" dark={true} platinum={false} />
            <Sponsors sponsors={silverSponsors} title="Silver Sponsors" dark={true} platinum={false} />
            <Sponsors sponsors={bronzeSponsors} title="Bronze Sponsors" dark={true} platinum={false} />
      </Layout>
    </>
  )
}