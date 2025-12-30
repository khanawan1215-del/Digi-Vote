'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/common/Sidebar';
import { Topbar } from '@/components/common/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

return (
  <div className="flex min-h-screen bg-gray-50">
    {/* Sidebar */}
    <Sidebar />
    
    {/* Main content */}
    <main className="flex-1 transition-all ml-0 sm:ml-64 p-2 sm:p-4 lg:p-6">
      <Topbar />
      {children}
    </main>
  </div>
);
}
