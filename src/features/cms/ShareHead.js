import Head from 'next/head';
import { shareTags } from './share.mjs';

// Description, canonical address and the preview card for links shared on LinkedIn, Slack and Facebook.
export function ShareHead({ share }) {
    return <Head>
        <link rel="canonical" href={share.url} key="canonical" />
        {shareTags(share).map(([attribute, key, content]) => <meta key={key} {...{ [attribute]: key }} content={content} />)}
    </Head>;
}
