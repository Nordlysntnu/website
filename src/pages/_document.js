import { Html, Head, Main, NextScript } from 'next/document'

// Runs before the first paint so the page never flashes the wrong theme.
// A saved choice wins; otherwise follow the system setting.
const themeScript = `(function(){var d=document.documentElement;try{var s=localStorage.getItem('theme');d.dataset.theme=s==='dark'||s==='light'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){d.dataset.theme='light'}})()`

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
