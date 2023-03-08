import '../styles/globals.css';

export default function App({ Component, pageProps }) {
    return (
        <>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"></meta>
            <Component {...pageProps} />
        </>
    );
}