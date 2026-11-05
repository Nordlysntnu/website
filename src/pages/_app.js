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
            {process.env.NEXT_PUBLIC_LOCAL_PREVIEW === 'true' && <aside style={{ background: '#b20b3a', color: '#fff', padding: '0.7rem 1rem', textAlign: 'center', position: 'relative', zIndex: 10000 }}>
                LOCAL TEST · Changes stay on this laptop · Forms do not send · <a style={{ color: '#fff' }} href="http://127.0.0.1:3010/admin" target="_blank" rel="noreferrer">Open CMS</a>
            </aside>}
            {/* Google tag (gtag.js) */}

            {process.env.NEXT_PUBLIC_LOCAL_PREVIEW !== 'true' && <><Script
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
            </Script></>}

            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"></meta>

            <main className={`${rubik.variable} ${khand.variable}`}>
                <Component {...pageProps}/>
            </main>
        </>
    );
}
