// app/about/page.tsx
"use client";

import React from "react";
import Navbar from "@/components/LandingPage/Navbar";
import Footer from "@/components/LandingPage/Footer";
import SupportForm from '@/components/SupportForm';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
            {/* Navbar */}
            <Navbar />

            {/* Page content */}
            <main className="pt-28 flex flex-col space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
            <SupportForm />
             </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
