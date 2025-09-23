import '@shared/styles/globals.css';
import Script from 'next/script';

export default function App({ Component, pageProps }) {
    return (
        <>
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
            <Component {...pageProps} />
        </>
    );
}
