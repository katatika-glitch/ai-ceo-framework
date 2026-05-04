import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SAYES',
  description: 'YES / NO だけで、あなたのプロダクトが生まれる',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geist.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
