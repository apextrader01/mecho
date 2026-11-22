import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'ShortEdge | Hyperlocal Indian Super-App',
  description: 'All-in-One Local Services Marketplace: Emergency Fuel Assist, Roadside Assistance, Multi-Vendor RFQ, Kirana & Daily Subscriptions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-orange-500 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
