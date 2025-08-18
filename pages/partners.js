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
import Prototal from '../public/Partners/Prototal.png';
import Easyform from '../public/Partners/Easyform.png';
import Trainor from '../public/Partners/Trainor.png';
import Link from 'next/link';
import styles from '../styles/partners.module.css';
import Holmefjord from '../public/Partners/Holmefjord.png';
import IFE from '../public/Partners/IFE.png';
import Bredengen from '../public/Partners/Bredengen.png';
import Aiko from '../public/Partners/Aiko.png';
import Valvoline from  '../public/Partners/Valvoline.png';
import Verktøyboden from  '../public/Partners/Verktøyboden.png';
import Easycomposites from '../public/Partners/Easycomposites.png';
import KongsbergMaritime from '../public/Partners/KongsbergMaritime.svg';
import CSEM from '../public/Partners/CSEM.svg';
import FREJA from '../public/Partners/FREJA.svg';
import SKF from '../public/Partners/SKF.svg';
import Elprint from '../public/Partners/Elprint.svg';
import Batemo from '../public/Partners/Batemo.svg';
import NTNU from '../public/Partners/NTNU.png';
import Kaercher from '../public/Partners/Kaercher.png';
import Permabond from '../public/Partners/Permabond.png';



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
    },
    'Easyform': {
      link: 'http://easyform.no/',
      image: Easyform.src,
      description: <>Easy Form AS was established in 2005 and has developed into a complete advisor and design provider, offering everything from design and engineering services to finished composite products. Easy Form has two of Europe's largest 5-axis CNC milling machines for machining large complex surfaces. Among other things, Easy Form is known for having built the first all-electric ferry made of composite materials, capable of transporting hazardous cargo, 'MF Barmøy.'</>
    },
    'AIKO': {
      link: 'https://aikosolar.com/',
      image: Aiko.src,
      description: <>AIKO, a top-ranked solar technology leader with BloombergNEF Tier 1 status, specializing in the research, development, and manufacturing of solar generation products and PV-storage-charging integrated solutions. AIKO provides customers with solar cells, ABC (All Back Contact) modules, and scenario-based packaged solutions. Guided by the mission of "Empowering transformation towards a carbon-free era," AIKO continues to pursue extreme innovation and cutting-edge technology.<br /><br />AIKO is contributing to project 2025 with cutting-edge high-efficient solar technology. AIKO doesn't only supply the technology, but also contributes with valuable expertise, helping Nordlys build a highly optimized PV system.</>
    },
    'CSEM': {
      link: 'https://www.csem.ch/en/',
      image: CSEM.src,
      description: <>Founded in 1984 and headquartered in Neuchâtel, CSEM is an internationally recognized innovation specialist with over 600 employees across six locations in Switzerland and more than 200 registered patents. They develop disruptive technologies with a high societal impact in the fields of precision manufacturing, digitalization, ultra-low-power electronics, optical elements, AI, and sustainable energy. They then transfer these innovations to industry partners in a variety of sectors, including renewable energy, healthcare, watchmaking, and aerospace, or encourage start-up creations.<br /><br />CSEM is contributing to the project of 2025 by integrating AIKOs high-efficiency solar cells into ultra light-weight and flexible solar modules.</>
    },
    'Batemo': {
      link: 'https://www.batemo.com/',
      image: Batemo.src,
      description: <>Batemo is the global technology leader for the development of lithium-ion battery simulation software. They combine the three technological assets of battery modeling, battery parameterization and battery data, which makes their products unique worldwide. They have had hundreds of battery cells in their lab, measured them over the entire operating range, completely disassembled and modeled them.<br /><br />Together with Batem we can accurately simulate and predict the performance of our battery modules.</>
    }
  }
  const goldSponsors = {
    'Rejlers': {
      link: "https://rejlers.no/",
      image: Rejlers.src,
      description: ""
    },
    'Freber': {
      link: "https://www.freber.no/",
      image: Freber.src,
      description: ""
    },
    'Holmefjord': {
      link: 'https://www.holmefjord.no/',
      image: Holmefjord.src,
      description: ""
    },
    'Kongsberg Maritime': {
      link: 'https://www.kongsberg.com/maritime/',
      image: KongsbergMaritime.src,
      description: ""
    },
    'Elprint': {
      link: 'https://elprint.no/',
      image: Elprint.src,
      description: ""
    },
  }
  const silverSponsors = {
    'Prototal': {
      link: "https://www.prototal.no/",
      image: Prototal.src,
      description: ""
    },
    'Trainor': {
      link: 'https://www.trainor.no/',
      image: Trainor.src,
      description: ""
    },
    'FREJA': {
      link: 'https://no.freja.com/',
      image: FREJA.src,
      description: ""
    },
    'SKF': {
      link: 'https://www.skf.com/no',
      image: SKF.src,
      description: ""
    },
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
    },
    'Bredengen': {
      link: 'https://www.bredengen.no/',
      image: Bredengen.src,
      description: ""
    },
    'Valvoline': {
      link: 'https://valvoline.no',
      image: Valvoline.src,
      description: ""
    },
    'Verktøyboden': {
      link: 'https://verktoyboden.no/',
      image: Verktøyboden.src,
      description: ""
    },
    'Kärcher': {
      link: 'https://karcher.com/no',
      image: Kaercher.src,
      description: ""
    },
    'Permabond': {
	link: 'https://permabond.no',
        image: Permabond.src,
	description: ""
    }
  }
  const OtherCollaborationPartners = {
    'Equinor': {
        link: 'http://www.Equinor.com',
        image: Equinor.src,
        description: ""
    },
    'IFE': {
      link: 'https://ife.no',
      image: IFE.src,
      description: ""
    },
    'Easycomposites': {
      link: 'https://www.easycomposites.eu',
      image: Easycomposites.src,
      description: ''
    },
    'NTNU': {
      link: 'https://www.ntnu.no',
      image: NTNU.src,
      description: ''
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
            <Sponsors sponsors={OtherCollaborationPartners} title="Other Collaboration Partners" dark={true} platinum={false} />
      </Layout>
    </>
  )
}
