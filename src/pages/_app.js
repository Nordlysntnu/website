import '@shared/styles/globals.css';
import { Rubik, Khand } from 'next/font/google';
import Script from 'next/script';

const rubik = Rubik({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-rubik',
})

const khand = Khand({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-khand',
})

export default function App({ Component, pageProps }) {
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"></meta>
            </Head>

            {/* Google tag (gtag.js) */}

            <Script
                strategy='afterInteractive'
                src='https://www.googletagmanager.com/gtag/js?id=G-3FFKC00053'
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){window.dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-3FFKC00053');
                `}
            </Script>

            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"></meta>

            <main className={`${rubik.variable} ${khand.variable}`}>
                <Component {...pageProps}/>
            </main>
        </>
    );
}
