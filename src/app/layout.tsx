import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/query-provider'
import { getCurrentUserAndProfile } from '@/services/profile'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Technoscope Randevu',
  description: 'Mersin Technoscope Kurumsal Randevu Takip ve Organizasyon Sistemi',
}

const SYSTEM_THEME_SCRIPT = `
  (function () {
    try {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getCurrentUserAndProfile()
  const darkModeKnown = profile !== null
  const isDark = profile?.dark_mode ?? false

  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased ${darkModeKnown && isDark ? 'dark' : ''}`}
    >
      <head>{!darkModeKnown && <script dangerouslySetInnerHTML={{ __html: SYSTEM_THEME_SCRIPT }} />}</head>
      <body className="h-full">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
