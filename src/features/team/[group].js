import { useRouter } from 'next/router';
import Head from "next/head";
import Layout from '../../../components/Layout';
import PageHeader from '../../../components/PageHeader';
import Content from "../../../components/Content";
import DoubleImage from "../../../components/DoubleImage";
import ImageFrontBig from '../../public/Group-photo-2.jpg';
import ImageBackBig from '../../public/Group-photo-1.jpg';
import ImageFrontSmall from '../../public/Group-photo-SOME-2.jpg';
import ImageBackSmall from '../../public/Group-photo-SOME-1.jpg';
import styles from '../../styles/SubPart1.module.css';
import { useState, useEffect } from 'react';
import TeamOverview from "../../../components/TeamOverview";

const TeamGroupPage = () => {
  const router = useRouter();
  const { group } = router.query;
  const [size, setSize] = useState('big');
  const [imageFront, setImageFront] = useState(ImageFrontBig.src);
  const [imageBack, setImageBack] = useState(ImageBackBig.src);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 600 && size === 'big') {
        setSize('small');
        setImageFront(ImageFrontSmall.src);
        setImageBack(ImageBackSmall.src);
      } else if (window.innerWidth > 600 && size === 'small') {
        setSize('big');
        setImageFront(ImageFrontBig.src);
        setImageBack(ImageBackBig.src);
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [size]);

  useEffect(() => {
    switch (group.toLowerCase()) {
      case 'board':
        setImageFront(ImageFrontBig.src);
        setImageBack(ImageBackBig.src);
        break;
      case 'electrical':
        setImageFront('/path/to/electrical-front.jpg');
        setImageBack('/path/to/electrical-back.jpg');
        break;
      case 'mechanical':
        setImageFront('/path/to/mechanical-front.jpg');
        setImageBack('/path/to/mechanical-back.jpg');
        break;
      case 'brand':
        setImageFront('/path/to/brand-front.jpg');
        setImageBack('/path/to/brand-back.jpg');
        break;
      case 'logistics':
        setImageFront('/path/to/logistics-front.jpg');
        setImageBack('/path/to/logistics-back.jpg');
        break;
      case 'alumni':
        setImageFront('/path/to/alumni-front.jpg');
        setImageBack('/path/to/alumni-back.jpg');
        break;
      default:
        setImageFront(ImageFrontBig.src);
        setImageBack(ImageBackBig.src);
    }
  }, [group]);

  return (
    <>
      <Head>
        <title>{group ? group.charAt(0).toUpperCase() + group.slice(1) : 'Team'} - Nordlys</title>
      </Head>
      <Layout>
        <PageHeader current="Team" />
        <Content>
          <h1>{group ? group.charAt(0).toUpperCase() + group.slice(1) : 'Team'}</h1>
          {group && <TeamOverview selectedGroup={group.charAt(0).toUpperCase() + group.slice(1)} />}
          <div className={styles.groupDescription}>
            <div className={styles.textBlock}>
              <p>{group ? `Description for ${group.charAt(0).toUpperCase() + group.slice(1)}` : 'Description for the team'}</p>
            </div>
            <div className={styles.imageBlock}>
              <DoubleImage front={imageFront} back={imageBack} />
            </div>
          </div>
        </Content>
        {/* Legg til kontaktform her */}
      </Layout>
    </>
  );
};

export default TeamGroupPage;