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
  viewport: 'width=device-width, initial-scale=1.0',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col`}
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
