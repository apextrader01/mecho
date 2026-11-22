import type { Metadata } from 'next';
import './globals.css';
import { VendorAuthProvider } from '../context/VendorAuthContext';

export const metadata: Metadata = {
  title: 'ShortEdge Vendor Portal | Local Partners & Highway Runners',
  description: 'Manage 24/7 SOS Dispatches, Itemized Quotations, Daily Subscriptions and Earnings',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-sky-500 selection:text-white">
        <VendorAuthProvider>{children}</VendorAuthProvider>
      </body>
    </html>
  );
}
