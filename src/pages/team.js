import Head from "next/head";
import { Suspense, lazy } from "react";
import Layout from '@shared/components/Layout';
import PageHeader from '@shared/components/PageHeader';
import Content from "@shared/components/Content";
import Link from 'next/link';
import ImageFrontBig from '../../public/members/group-photos/P2026_Group_fun.jpeg';
import ImageBackBig from '../../public/members/group-photos/P2026_Group.jpeg';
import ImageFrontSmall from '../../public/members/group-photos/P2026_Group_fun.jpeg';
import ImageBackSmall from '../../public/members/group-photos/P2026_Group.jpeg';
import styles from '@shared/styles/SubPart1.module.css';
import { useState, useEffect } from 'react';
import TeamOverview from "@features/team/TeamOverview";
import DoubleImage from "@features/team/DoubleImage";

export default function Team() {
    const [size, setSize] = useState('big');
    const [imageFront, setImageFront] = useState("/members/group-photos/P2026_Group_fun.jpeg");
    const [imageBack, setImageBack] = useState("/members/group-photos/P2026_Group.jpeg");

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth <= 600 && size === 'big') {
                setSize('small');
                setImageFront("/members/group-photos/P2026_Group_fun.jpeg");
                setImageBack("/members/group-photos/P2026_Group.jpeg");
            } else if (window.innerWidth > 600 && size === 'small') {
                setSize('big');
                setImageFront("/members/group-photos/P2026_Group_fun.jpeg");
                setImageBack("/members/group-photos/P2026_Group.jpeg");
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
                In September of 2023 the first ever full Solar Racing team from Norway was finally formed. The team consists of a highly multi-disciplinary team, distributed between the groups of Mechanical, Electrical, Software, Brand, Logistics and the Board. This marks an outstanding achievement in Norwegian Solar racing history!
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
