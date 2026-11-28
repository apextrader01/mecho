import type { Metadata, Viewport } from 'next';
import './globals.css';
import { VendorAuthProvider } from '../context/VendorAuthContext';
import EcosystemSwitcher from '../components/EcosystemSwitcher';

export const metadata: Metadata = {
  title: 'ShortEdge Vendor Portal | Local Partners & Highway Runners',
  description: 'Manage 24/7 SOS Dispatches, Itemized Quotations, Daily Subscriptions and Earnings',
  manifest: '/vendor/manifest.json',
  icons: {
    icon: '/vendor/icon.svg',
    apple: '/vendor/icon.svg'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SE Partner'
  }
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/vendor/manifest.json" />
        <link rel="icon" href="/vendor/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/vendor/icon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased selection:bg-sky-500 selection:text-white">
        <EcosystemSwitcher current="vendor" />
        <VendorAuthProvider>{children}</VendorAuthProvider>
      </body>
    </html>
  );
}
