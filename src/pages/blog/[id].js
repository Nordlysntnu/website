import Head from 'next/head';
import Layout from '@shared/components/Layout';
import { CmsArticle } from '@features/cms/CmsBlog';
import { readWebsitePosts } from '@features/cms/snapshot-posts.mjs';
import { blogs } from '@shared/data/blog';

export async function getStaticPaths() {
    const posts = await readWebsitePosts({ legacyBlogs: blogs });
    return { paths: (posts || []).flatMap(post => [...new Set([post.slug || String(post.id), String(post.id)])].map(id => ({ params: { id } }))), fallback: false };
}
export async function getStaticProps({ params }) {
    const posts = await readWebsitePosts({ legacyBlogs: blogs });
    const post = posts?.find((item) => (String(item.id) === params.id || item.slug === params.id));
    return post ? { props: { post } } : { notFound: true };
}
export default function Article({ post }) {
    return <Layout><Head><title>{post.title} · Nordlys</title></Head><CmsArticle post={post} /></Layout>;
}
