import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { ThemeToggle } from '@/components/ThemeToggle'
import './style.css'
export const metadata: Metadata = { title: 'Nordlys CMS', robots: { index: false, follow: false } }
export default async function Layout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get('payload-theme')?.value === 'light' ? 'light' : 'dark'
  const local = process.env.CMS_ENV !== 'production'
  return <html lang="en" data-theme={theme}><body>
    {local && <div className="demo-banner">LOCAL CMS · Changes stay on this computer</div>}
    <header className="demo-header">
      <Link className="demo-brand" href="/blog"><span>▰</span> Nordlys</Link>
      <nav aria-label="CMS navigation"><Link href="/blog">Blog</Link><Link href="/admin">Editorial workspace ↗</Link><ThemeToggle initialTheme={theme} /></nav>
    </header>
    {children}
    <footer className="demo-footer">Nordlys NTNU · Editorial workspace</footer>
  </body></html>
}
