import { useRouter } from 'next/router';
import Head from "next/head";
import Layout from '@shared/components/Layout';
import PageHeader from '@shared/components/PageHeader';
import Content from "@shared/components/Content";
import DoubleImage from "@features/team/DoubleImage";
const ImageFrontBig = "/images/members/group-photos/Group-photo-2.jpg";
const ImageBackBig = "/images/members/group-photos/Group-photo-1.jpg";
const ImageFrontSmall = "/images/members/group-photos/Group-photo-SOME-2.jpg";
const ImageBackSmall = "/images/members/group-photos/Group-photo-SOME-1.jpg";
import styles from '@shared/styles/SubPart1.module.css';
import { useState, useEffect } from 'react';
import TeamOverview from "@features/team/TeamOverview";

const TeamGroupPage = () => {
  const router = useRouter();
  const { group } = router.query;
  const [size, setSize] = useState('big');
  const [imageFront, setImageFront] = useState(ImageFrontBig);
  const [imageBack, setImageBack] = useState(ImageBackBig);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 600 && size === 'big') {
        setSize('small');
        setImageFront(ImageFrontSmall);
        setImageBack(ImageBackSmall);
      } else if (window.innerWidth > 600 && size === 'small') {
        setSize('big');
        setImageFront(ImageFrontBig);
        setImageBack(ImageBackBig);
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [size]);

  useEffect(() => {
    switch (group.toLowerCase()) {
      case 'board':
        setImageFront(ImageFrontBig);
        setImageBack(ImageBackBig);
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
        setImageFront(ImageFrontBig);
        setImageBack(ImageBackBig);
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