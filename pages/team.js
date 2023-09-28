import Head from "next/head";
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Content from "../components/Content";
import DoubleImage from "../components/DoubleImage";
import ImageFrontBig from '../public/Group-photo-2.jpg';
import ImageBackBig from '../public/Group-photo-1.jpg';
import ImageFrontSmall from '../public/Group-photo-SOME-2.jpg';
import ImageBackSmall from '../public/Group-photo-SOME-1.jpg';
import Link from 'next/Link';
import styles from '../styles/SubPart1.module.css';
import { useState, useEffect } from 'react';

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
                In September of 2023 the first ever full Solar Racing team from Norway was finally formed. The team consists of a highly multi-disciplinary team, distributed between the groups of Mechanical, Electrical, Strategy, Brand and the Board. This marks an outstanding achievement in Norwegian Solar racing history!
                <br />
                <br />
                <DoubleImage imageFront={imageFront} imageBack={imageBack} />
                <br />
                Do you want to become part of the team? Read more about our groups and apply!
                <br />
                <br />
                <Link href="/join" className={styles.link}>Read more</Link>
            </Content>
        </Layout>
        </>
    )
}