import Head from "next/head";
import Layout from '@shared/components/Layout';
import PageHeader from '@shared/components/PageHeader';
import Content from "@shared/components/Content";
import Link from 'next/link';
import ImageFrontBig from '../../public/members/group-photos/compressed/P2026_Group_fun.jpg';
import ImageBackBig from '../../public/members/group-photos/compressed/P2026_Group.jpg';
import ImageFrontSmall from '../../public/members/group-photos/compressed/P2026_Group_fun.jpg';
import ImageBackSmall from '../../public/members/group-photos/compressed/P2026_Group.jpg';
import styles from '@shared/styles/SubPart1.module.css';
import { useState, useEffect } from 'react';
import TeamOverview from "@features/team/TeamOverview";
import { projects } from "@features/team/data/projects";

import DoubleImage from "@features/team/DoubleImage";

const activeGroups = projects[0].groups.filter(group => !["Technical advisor", "Alumni"].includes(group));
const groupList = new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(activeGroups);

export default function Team() {
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
        window.addEventListener('resize', handleResize)
        handleResize()
    })
    return (
        <>
        <Head>
            <title>Nordlys</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <Layout current="Team">
            <></>
            <PageHeader title="Team" />
            <Content dark={true}>
                In September 2023, Norway’s first full solar racing team was formed. Nordlys brings together students across {groupList}. Our technical advisors support the team with experience from research, engineering and solar racing.
                <br />
                <br />
                Do you want to become part of the team?
                <br />
                <br />
                <Link href="/join" className={styles.link}>Apply here</Link>
            </Content>
            <TeamOverview />
            <Content dark={false}>
                <DoubleImage imageFront={imageFront} imageBack={imageBack} />
            </Content>
        </Layout>
        </>
    )
}