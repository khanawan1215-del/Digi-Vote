// app/privacy-policy/page.tsx
"use client";

import React from "react";
import Navbar from "@/components/LandingPage/Navbar";
import Footer from "@/components/LandingPage/Footer";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
            {/* Navbar */}
            <Navbar />

            {/* Page content */}
            <main className="pt-28 flex flex-col space-y-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <section className="text-center">
                    <h1 className="text-5xl md:text-6xl font-black mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-xl md:text-2xl leading-relaxed text-white/90">
                        Your privacy is important to us. This policy explains how Digi-Vote AI
                        collects, uses, and protects your personal information while ensuring a
                        secure and transparent voting experience.
                    </p>
                </section>

                {/* Policy Sections */}
                <section className="space-y-8">
                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500">
                        <h2 className="text-3xl font-bold mb-4">Information Collection</h2>
                        <p>
                            We collect only the information necessary for voter verification, including
                            student ID, email, and facial verification data. This data is never shared
                            with third parties without consent.
                        </p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500">
                        <h2 className="text-3xl font-bold mb-4">Data Usage</h2>
                        <p>
                            Collected data is used solely for authenticating voters and ensuring
                            secure, transparent election processes. We do not sell or use data for
                            marketing purposes.
                        </p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500">
                        <h2 className="text-3xl font-bold mb-4">Data Protection</h2>
                        <p>
                            All data is encrypted and stored securely. Only authorized personnel can
                            access the data, and it is monitored for any suspicious activity to
                            prevent breaches.
                        </p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500">
                        <h2 className="text-3xl font-bold mb-4">Your Rights</h2>
                        <p>
                            You have the right to access, update, or request deletion of your personal
                            information at any time. Contact us at support@digi-vote.ai for any
                            privacy concerns.
                        </p>
                    </div>
                </section>

                {/* Extra space at the bottom */}
                <div className="h-32" />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
