import './globals.css'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import { Header } from '@/components/Header'

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '700', '900'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Primeweb — Hard discount Mauritius',
  description: 'Primeweb — le panier malin pour les Mauriciens. Détail, gros, et live deals via WhatsApp.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen antialiased">
        <Header />

        {children}

        <footer className="mt-24 border-t border-ink-300/60 bg-prime-900 text-ink-100">
          <div className="mx-auto max-w-screen-2xl px-4 py-12">
            <div className="grid gap-10 md:grid-cols-4">
              <div className="md:col-span-2">
                <Image
                  src="/primeweb-logo.webp"
                  alt="Primeweb"
                  width={3733}
                  height={575}
                  className="h-[22px] w-auto brightness-0 invert"
                />
                <p className="mt-4 max-w-sm text-sm text-ink-300">
                  Le panier malin pour Maurice — détail, gros, et reels qui se commandent en deux clics sur WhatsApp.
                </p>

                <div className="mt-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-ink-500">Suivez-nous</div>
                  <ul className="mt-2 flex items-center gap-2">
                    <li>
                      <a
                        href="https://www.instagram.com/primeweb"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Instagram"
                        className="group grid h-9 w-9 place-items-center rounded-full border border-prime-700/40 bg-prime-700/30 text-paper transition hover:border-transparent hover:bg-gradient-to-br hover:from-[#feda77] hover:via-[#f58529] hover:to-[#dd2a7b]"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="5" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                        </svg>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.tiktok.com/@primeweb"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="TikTok"
                        className="grid h-9 w-9 place-items-center rounded-full border border-prime-700/40 bg-prime-700/30 text-paper transition hover:border-transparent hover:bg-ink-950"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                          <path d="M19.6 7.5a5.7 5.7 0 0 1-3.4-1.1V15a4.7 4.7 0 1 1-4.7-4.7c.4 0 .7 0 1 .1v2.5a2.2 2.2 0 1 0 1.5 2.1V3h2.4a3.5 3.5 0 0 0 3.2 3.1v1.4Z" />
                        </svg>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.facebook.com/primeweb"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Facebook"
                        className="grid h-9 w-9 place-items-center rounded-full border border-prime-700/40 bg-prime-700/30 text-paper transition hover:border-transparent hover:bg-[#1877f2]"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                          <path d="M13.5 22V12.5h3l.5-3.5h-3.5V6.7c0-1 .3-1.7 1.7-1.7H17V2.1c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V9H7v3.5h3V22h3.5Z" />
                        </svg>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://wa.me/23057000000"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="WhatsApp"
                        className="grid h-9 w-9 place-items-center rounded-full border border-prime-700/40 bg-prime-700/30 text-paper transition hover:border-transparent hover:bg-mint-500"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                          <path d="M20.5 3.5A11 11 0 0 0 3.6 17.7L2 22l4.4-1.6A11 11 0 1 0 20.5 3.5Zm-8.5 18a9.4 9.4 0 0 1-4.8-1.3l-.3-.2-2.6 1 1-2.6-.2-.3a9.5 9.5 0 1 1 6.9 3.4Zm5.4-7c-.3-.2-1.7-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7 0a7.7 7.7 0 0 1-2.3-1.4 8.7 8.7 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5s0-.4 0-.6l-.9-2.2c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4a3 3 0 0 0-1 2.3 5.3 5.3 0 0 0 1.1 2.8c.1.2 1.9 3 4.7 4.2 2.8 1.1 2.8.7 3.3.7s1.7-.7 2-1.3.3-1.2.2-1.3l-.6-.3Z" />
                        </svg>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-ink-500">Boutique</div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  <li><Link href="/flash"     className="hover:text-prime-500">Flash deals</Link></li>
                  <li><Link href="/wholesale" className="hover:text-prime-500">Gros / Tabagie</Link></li>
                  <li><Link href="/reels"     className="hover:text-prime-500">Reels shoppables</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-ink-500">Contact</div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  <li>WhatsApp: <span className="font-mono">+230 5700 0000</span></li>
                  <li>Livraison Maurice 🇲🇺</li>
                </ul>
              </div>
            </div>
            <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-prime-700/40 pt-6 text-xs text-ink-300 md:flex-row md:items-center">
              <span>© {new Date().getFullYear()} Primeweb · construit pour les tabagies et les familles.</span>
              <span>🇲🇺 Made in Maurice</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
