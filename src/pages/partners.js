import Head from 'next/head';
import Layout from '@shared/components/Layout';
import PageHeader from '@shared/components/PageHeader';
import Content from "@shared/components/Content";
import Sponsors from "@features/partners/Sponsors"
import Aneo from '@features/partners/sponsor-logos/Aneo.svg';
import BrynAarflot from '@features/partners/sponsor-logos/BrynAarflot.png';
import Equinor from '@features/partners/sponsor-logos/Equinor.png';
import InterPersonell from '@features/partners/sponsor-logos/InterPersonell.svg';
import Rejlers from '@features/partners/sponsor-logos/Rejlers.png';
import Freber from '@features/partners/sponsor-logos/Freber.png';
import Biesterfeld from '@features/partners/sponsor-logos/Biesterfeld.png';
import Hydro from '@features/partners/sponsor-logos/Hydro.png';
import Prototal from '@features/partners/sponsor-logos/Prototal.png';
import Easyform from '@features/partners/sponsor-logos/Easyform.png';
import Trainor from '@features/partners/sponsor-logos/Trainor.png';
import Link from 'next/link';
import styles from '@features/partners/styles/partners.module.css';
import Holmefjord from '@features/partners/sponsor-logos/Holmefjord.png';
import IFE from '@features/partners/sponsor-logos/IFE.png';
import Bredengen from '@features/partners/sponsor-logos/Bredengen.png';
import Aiko from '@features/partners/sponsor-logos/Aiko.png';
import Valvoline from  '@features/partners/sponsor-logos/Valvoline.png';
import Verktøyboden from  '@features/partners/sponsor-logos/Verktøyboden.png';
import Easycomposites from '@features/partners/sponsor-logos/Easycomposites.png';
import KongsbergMaritime from '@features/partners/sponsor-logos/KongsbergMaritime.png';
import CSEM from '@features/partners/sponsor-logos/CSEM.svg';
import FREJA from '@features/partners/sponsor-logos/FREJA.svg';
import SKF from '@features/partners/sponsor-logos/SKF.svg';
import Elprint from '@features/partners/sponsor-logos/Elprint.svg';
import Batemo from '@features/partners/sponsor-logos/Batemo.svg';
import NTNU from '@features/partners/sponsor-logos/NTNU.png';
import Kaercher from '@features/partners/sponsor-logos/Kaercher.png';
import Permabond from '@features/partners/sponsor-logos/Permabond.png';
import Altium from '@features/partners/sponsor-logos/Altium.png';
import Ansys from '@features/partners/sponsor-logos/Ansys.png';
import EDR from '@features/partners/sponsor-logos/EDR.png';
import CNC from '@features/partners/sponsor-logos/cncc.png';
import Melbye from '@features/partners/sponsor-logos/melbye.png';
import IMS from '@features/partners/sponsor-logos/IMS.png';
import Connexion from '@features/partners/sponsor-logos/3dconnexion.png';
import Tampnet from '@features/partners/sponsor-logos/Tampnet.png';
import AIL from '@features/partners/sponsor-logos/AIL.png';
import Newtracks from '@features/partners/sponsor-logos/newtracks.avif';
import Meracing from '@features/partners/sponsor-logos/meracing.jpg';
import Diab from '@features/partners/sponsor-logos/Diab_Group.webp';



export default function About() {
  const platinumSponsors = {
    'CSEM': {
      link: 'https://www.csem.ch/en/',
      image: CSEM.src,
      description: <>Founded in 1984 and headquartered in Neuchâtel, CSEM is an internationally recognized innovation specialist with over 600 employees across six locations in Switzerland and more than 200 registered patents. They develop disruptive technologies with a high societal impact in the fields of precision manufacturing, digitalization, ultra-low-power electronics, optical elements, AI, and sustainable energy. They then transfer these innovations to industry partners in a variety of sectors, including renewable energy, healthcare, watchmaking, and aerospace, or encourage start-up creations.<br /><br />CSEM is contributing to our cars by integrating AIKOs high-efficiency solar cells into ultra light-weight and flexible solar modules.</>
    },
    'Holmefjord': {
      link: 'https://www.holmefjord.no/',
      image: Holmefjord.src,
      description: <>Founded by Jørgen Holmefjord in 1984, Holmefjord is one of the leading providers of signals cabling in Norway, and deliver cabling and related equipment to various industries, such as communication, electronics, automation, and data centers. <br></br><br></br> Holmefjord contributes to Nordlys by delivering high-quality cabling that we use to deliver power and signals between different systems within our car.</> 
    },
  }
  const goldSponsors = {
    'Kongsberg Maritime': {
      link: 'https://www.kongsberg.com/maritime/',
      image: KongsbergMaritime.src,
      description: ""
    },
    '3d-connexions': {
      link: 'https://3dconnexion.com/no',
      image: Connexion.src,
      description: ""
    }
  }
  const silverSponsors = {
    'Trainor': {
      link: 'https://www.trainor.no/',
      image: Trainor.src,
      description: ""
    },
    'Melbye': {
      link: 'https://melbye.no',
      image: Melbye.src,
      description: ""
    },
    'IMS': {
      link: 'https://IMS.no',
      image: IMS.src,
      description: ""
    },
    'IFE': {
      link: 'https://ife.no',
      image: IFE.src,
      description: ""
    },
    'AIKO': {
      link: 'https://aikosolar.com/',
      image: Aiko.src,
      description: ""
    },
    'SKF': {
      link: 'https://skf.com/no',
      image: SKF.src,
      description: ""
    },
    'Tampnet': {
      link: 'https://www.tampnet.com/',
      image: Tampnet.src,
      description: ""
    },
    'Newtracks': {
      link: 'https://www.newtracks.no',
      image: Newtracks.src,
      description: ""
    },
  }
  const bronzeSponsors = {
    'CNC Consult': {
      link: 'https://cncc.no',
      image: CNC.src,
      description: ''
    }

  }
  const OtherCollaborationPartners = {
    'Easycomposites': {
      link: 'https://www.easycomposites.eu',
      image: Easycomposites.src,
      description: ''
    },
    'NTNU': {
      link: 'https://www.ntnu.no',
      image: NTNU.src,
      description: ''
    },
    'Altium': {
      link: 'https://www.altium.com/',
      image: Altium.src,
      description: ''
    },
    'Ansys': {
      link: 'https://www.ansys.com/',
      image: Ansys.src,
      description: ''
    },
    'EDR': {
      link: 'https://edrmedeso.com/',
      image: EDR.src,
      description: ''
    },
    'ME Racing': {
      link: 'https://meracing.com',
      image: Meracing.src,
      description: ''
    },
    'Diab Group': {
      link: 'https://diabgroup.com',
      image: Diab.src,
      desctiption: ''
    },
    'Alf I. Larsen': {
      link: 'https://ail.no',
      image: AIL.src,
      description: ''
    },
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
