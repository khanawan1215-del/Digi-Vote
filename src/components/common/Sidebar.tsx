'use client';

import { useUIStore } from '@/lib/store/uiStore';
import { useRouter } from "next/navigation";
import { useAuthStore } from '@/lib/store/authStore';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiX, FiHome, FiUsers, FiSettings, FiLogOut, FiCheckCircle, FiClock, FiArchive, FiHelpCircle } from 'react-icons/fi';
import Image from 'next/image';
import { getMediaUrl } from '@/lib/utils/media';

export const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { href: '/elections', label: 'Elections', icon: <FiCheckCircle /> },
    { href: '/societies', label: 'Societies', icon: <FiUsers /> },
    { href: '/my-societies', label: 'My Societies', icon: <FiUsers />, showFor: ['society_admin', 'superadmin'] },
    { href: '/my-elections', label: 'My Elections', icon: <FiCheckCircle />, showFor: ['society_admin', 'superadmin'] },
    { href: '/history/voting', label: 'Elections History', icon: <FiClock /> },
    { href: '/history/admin', label: 'History', icon: <FiArchive />, showFor: ['society_admin', 'superadmin'] },
    { href: '/profile', label: 'Profile', icon: <FiSettings /> },
    { href: '/support', label: 'Contact Support', icon: <FiHelpCircle /> },
  ];

  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-2 mb-6">
        <h2 className="text-2xl font-extrabold text-indigo-600 tracking-tight">
          Digi-Vote AI
        </h2>
        <button
          onClick={closeSidebar}
          className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <FiX className="text-xl text-gray-700" />
        </button>
      </div>

      {/* ✅ User Info (Vertical layout, like before) */}
      <div className="flex flex-col items-center text-center py-4 border-b border-gray-200">
        {/* Avatar */}
        {user?.face_image ? (
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
              <Image
                src={getMediaUrl(user?.face_image)}
                alt="User Avatar"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        ) : (
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
            {user?.first_name?.[0] ?? 'U'}
          </div>
        )}

        {/* Name */}
        <p className="mt-3 font-semibold text-gray-800">
          {user?.first_name} {user?.last_name}
        </p>

        {/* Role */}
        <p className="text-sm text-gray-500 capitalize">
          {user?.role || 'User'}
        </p>

        {/* Student ID */}
        {user?.student_id && (
          <p className="text-xs text-gray-400 mt-1">
            Role No: {user.student_id}
          </p>
        )}

        {/* Verified badge */}
        <span className="mt-3 text-xs px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold">
          ✓ Verified
        </span>
      </div>


      {/* Navigation */}
      <nav className="flex-1 mt-4">
        {navLinks.map((link) => {
          if (!user) return null;
          if (link.showFor && !link.showFor.includes(user?.role)) return null;

          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 mx-3 my-1 p-3 rounded-lg font-medium 
                        transition-all transition-transform duration-200 ease-out
                        ${isActive
                  ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600'
                  : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:translate-x-2'
                }`}

            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}

      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-red-600 hover:bg-red-50 p-3 rounded-lg font-medium
               transition-all transition-transform duration-200 ease-out
               hover:translate-x-2"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex w-64 h-screen 
    bg-gradient-to-br from-indigo-100 via-purple-300 to-purple-300 shadow-lg fixed left-0 top-0 p-4 overflow-y-auto">
        {SidebarContent}
      </aside>

      {/* Overlay for Mobile */}
      <div
        className={`sm:hidden fixed inset-0 z-40 bg-black/40 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={closeSidebar}
      />

      {/* Mobile Sidebar */}
      <aside
        className={`sm:hidden fixed left-0 top-0 w-64 h-screen overflow-y-auto bg-white z-50 p-4 shadow-xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {SidebarContent}
      </aside>
    </>
  );
};
