import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import RootProvider from '@/components/RootProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ChainMatch - Decentralized Dating App',
  description:
    'Find meaningful connections securely with ChainMatch, the blockchain-powered dating app that ensures trust, transparency, and authenticity.',
  keywords: [
    'decentralized dating app',
    'blockchain dating',
    'secure dating',
    'ChainMatch',
    'trustworthy dating app',
    'blockchain-powered matchmaking',
  ],
  authors: [{ name: 'ChainMatch Team' }],
  openGraph: {
    title: 'ChainMatch - Decentralized Dating App',
    description:
      'Find meaningful connections securely with ChainMatch, the blockchain-powered dating app that ensures trust, transparency, and authenticity.',
    url: 'https://chainmatch.app',
    siteName: 'ChainMatch',
    images: [
      {
        url: 'https://chainmatch.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ChainMatch - Decentralized Dating App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChainMatch - Decentralized Dating App',
    description:
      'Find meaningful connections securely with ChainMatch, the blockchain-powered dating app that ensures trust, transparency, and authenticity.',
    images: ['https://chainmatch.app/og-image.png'],
  },
};

export const viewport = 'width=device-width, initial-scale=1.0';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <link
          rel='icon'
          href='/favicon-512x512.png'
          sizes='512x512'
          type='image/png'
        />
        <link
          rel='icon'
          href='/favicon-192x192.png'
          sizes='192x192'
          type='image/png'
        />
        <link
          rel='icon'
          href='/favicon-32x32.png'
          sizes='32x32'
          type='image/png'
        />
        <link
          rel='icon'
          href='/favicon-16x16.png'
          sizes='16x16'
          type='image/png'
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col`}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
