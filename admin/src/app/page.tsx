'use client';

import React, { useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import KycVerificationTab from '../components/KycVerificationTab';
import LiveDispatchesTab from '../components/LiveDispatchesTab';
import CategoryManagerTab from '../components/CategoryManagerTab';
import CustomerDirectoryTab from '../components/CustomerDirectoryTab';
import VendorRosterTab from '../components/VendorRosterTab';

export default function AdminHomePage() {
  const [activeTab, setActiveTab] = useState<string>('kyc');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'kyc' && <KycVerificationTab />}
        {activeTab === 'dispatches' && <LiveDispatchesTab />}
        {activeTab === 'customers' && <CustomerDirectoryTab />}
        {activeTab === 'vendors' && <VendorRosterTab />}
        {activeTab === 'categories' && <CategoryManagerTab />}
      </main>
    </div>
  );
}
