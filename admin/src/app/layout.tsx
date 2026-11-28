import type { Metadata } from 'next';
import './globals.css';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import EcosystemSwitcher from '../components/EcosystemSwitcher';

export const metadata: Metadata = {
  title: 'ShortEdge Admin Console | Hyperlocal Operations & KYC',
  description: 'Manage KYC Verifications, Live Dispatches, Categories and Dynamic Pricing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-violet-500 selection:text-white">
        <EcosystemSwitcher current="admin" />
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
