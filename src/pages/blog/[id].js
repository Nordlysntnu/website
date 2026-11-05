import Head from 'next/head';
import Layout from '@shared/components/Layout';
import { CmsArticle } from '@features/cms/CmsBlog';
import { readLocalPosts } from '@features/cms/local-posts.mjs';

export async function getStaticPaths() {
    const posts = await readLocalPosts();
    return { paths: (posts || []).map((post) => ({ params: { id: String(post.id) } })), fallback: false };
}
export async function getStaticProps({ params }) {
    const posts = await readLocalPosts();
    const post = posts?.find((item) => String(item.id) === params.id);
    return post ? { props: { post } } : { notFound: true };
}
export default function Article({ post }) {
    return <Layout><Head><title>{post.title} · Nordlys</title></Head><CmsArticle post={post} /></Layout>;
}
