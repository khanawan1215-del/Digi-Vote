'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { FiMenu } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store/authStore';
import { useUIStore } from '@/lib/store/uiStore';
import Image from 'next/image';
import { getMediaUrl } from '@/lib/utils/media';
// import { NotificationBell } from './NotificationBell';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/elections': 'Elections',
  '/societies': 'Societies',
  '/my-societies': 'My Societies',
  '/my-elections': 'My Elections',
  '/profile': 'Profile',
  '/voting': 'Voting',
};

export const Topbar = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  const title =
    pageTitles[pathname] ||
    pathname.split('/').pop()?.replace('-', ' ').toUpperCase() ||
    'Dashboard';

  return (
    <div className="bg-gradient-to-br from-indigo-100 via-purple-300 to-purple-300 backdrop-blur-xl shadow-lg rounded-2xl p-4 flex items-center justify-between mb-6 transition-all">
      {/* Left: Menu button + title */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="sm:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          <FiMenu className="text-xl text-gray-700" />
        </button>

        {/* Page title */}
        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          {title}
        </h1>
      </div>

      {/* Right: Avatar / full user info */}
      <div>
        {/* Mobile: only circular image */}
        <div className="sm:hidden w-10 h-10 rounded-full overflow-hidden border-2 border-gradient-to-br from-indigo-500 to-purple-600">
          {user?.face_image ? (
            <Image
              src={getMediaUrl(user.face_image)}
              alt="User Avatar"
              width={40}
              height={40}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {user?.first_name?.[0] ?? 'U'}
            </div>
          )}
        </div>

        {/* Desktop: full avatar + name + role */}
        <div className="hidden sm:flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 hover:shadow-md transition">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 text-sm">
              {user?.first_name} {user?.last_name}
            </span>
            <span className="text-xs capitalize text-gray-500">
              {user?.role || 'User'}
            </span>
            {/* <NotificationBell /> */}
          </div>
        </div>
      </div>
    </div>
  );
};
