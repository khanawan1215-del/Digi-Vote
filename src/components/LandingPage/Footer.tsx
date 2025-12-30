"use client";


import React from "react";
import { usePathname, useRouter } from "next/navigation";

// Define types for links and sections
type Link =
  | { type: "section"; label: string }
  | { type: "page"; label: string; href: string }
  | { type: "external"; label: string; href: string };

type Section = {
  title: string;
  links: Link[];
};

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  // Scroll to a section on the homepage
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80; // navbar height
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Handle click on footer links
  const handleClick = (link: Link) => {
    if (link.type === "section") {
      const sectionId = link.label.toLowerCase().replace(/\s+/g, "-");
      if (pathname === "/") {
        scrollToSection(sectionId);
      } else {
        router.push("/#" + sectionId);
      }
    } else if (link.type === "page") {
      router.push(link.href);
    } else if (link.type === "external") {
      window.open(link.href, "_blank");
    }
  };

  // Footer link sections
  const sections: Section[] = [
    {
      title: "Quick Links",
      links: [
        { label: "Home", type: "section" },
        { label: "Features", type: "section" },
        { label: "How It Works", type: "section" },
        { label: "About", type: "page", href: "/about" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", type: "section" },
        { label: "FAQs", type: "section" },
        { label: "Contact Us", type: "section" },
        { label: "Privacy Policy", type: "page", href: "/privacy-policy" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Facebook", type: "external", href: "https://facebook.com" },
        { label: "Twitter", type: "external", href: "https://twitter.com" },
        { label: "LinkedIn", type: "external", href: "https://linkedin.com" },
        { label: "Instagram", type: "external", href: "https://instagram.com" },
      ],
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand info */}
          <div>
            <h3 className="text-xl font-bold text-cyan-400 mb-4">
              Digi-Vote AI
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Empowering universities with secure, transparent, and AI-powered
              voting solutions.
            </p>
          </div>

          {/* Footer links */}
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="text-xl font-bold text-cyan-400 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link: Link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleClick(link)}
                      className="text-gray-400 hover:text-white hover:pl-2 transition-all"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}

              </ul>
            </div>
          ))}
        </div>

        {/* Footer bottom */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Digi-Vote AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
