import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Antiframer — AI-Powered Creative Studio',
  description: 'Antiframer is a Karachi-based AI creative agency creating scroll-stopping videos, avatars, and images for Pakistani businesses — fast, bold, and affordable.',
  generator: 'v0.app',
  alternates: {
    types: { 'application/rss+xml': '/blog/rss.xml' },
  },
  openGraph: {
    images: '/hero-portrait-og.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ea0e4b',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <link rel="preload" as="image" href="/hero-portrait.png" />
      </head>
      <body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body>
    </html>
  )
}
