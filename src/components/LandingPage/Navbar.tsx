
"use client";

import React, { useState, useEffect } from "react";
import { FiMenu, FiX, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Scroll shadow effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll to section (if on landing page)
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80; // adjust for navbar height
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleNav = (id: string) => {
    const sectionId = id.toLowerCase().replace(/\s+/g, "-");
    if (pathname === "/") {
      scrollToSection(sectionId);
    } else {
      router.push("/#" + sectionId);
      setIsMenuOpen(false);
    }
  };

  const links = ["Home", "Features", "How It Works", "About"];

  // 👇 Dynamic button text and link
  const isLoginPage = pathname === "/login";
  const authButtonText = isLoginPage ? "Register" : "Login";
  const authButtonLink = isLoginPage ? "/register" : "/login";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-lg shadow-lg" : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform duration-300">
              <img
                src="/images/elec-logo.png"   // path to your image (usually in /public)
                alt="Logo"
                className="w-14 h-14 object-contain"
              />
            </div>

            <span
              className={`text-2xl font-black tracking-tight ${scrolled ? "text-gray-900" : "text-white"
                }`}
            >
              Digi-Vote AI
            </span>
          </div>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center space-x-8">
            {links.map((item) => (
              <li key={item}>
                <button
                  onClick={() => handleNav(item)}
                  className={`font-semibold text-base transition-colors hover:text-indigo-600 relative group ${scrolled ? "text-gray-700" : "text-white"
                    }`}
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </button>
              </li>
            ))}
            <li>
              <Link
                href={authButtonLink}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                {authButtonText}
              </Link>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${scrolled ? "text-gray-900" : "text-white"
              }`}
          >
            {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200">
          <ul className="px-4 py-6 space-y-4">
            {links.map((item) => (
              <li key={item}>
                <button
                  onClick={() => handleNav(item)}
                  className="block w-full text-left font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  {item}
                </button>
              </li>
            ))}
            <li>
              <Link
                href={authButtonLink}
                className="w-full px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold inline-block text-center"
              >
                {authButtonText}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
