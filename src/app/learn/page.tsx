// app/about/page.tsx
"use client";

import React from "react";
import Navbar from "@/components/LandingPage/Navbar";
import Footer from "@/components/LandingPage/Footer";

export default function LearnPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
            {/* Navbar */}
            <Navbar />

            {/* Page content */}
            <main className="min-h-screen text-white   pt-10">
                <section className="max-w-4xl mx-auto px-6 py-16">
                    <h1 className="text-4xl font-bold mb-6 text-center">Learn More About Digi-Vote AI</h1>
                    <p className="text-lg mb-8 text-center">
                        Digi-Vote AI is a secure, reliable, and intelligent digital voting platform designed to transform student elections.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">What is Digi-Vote AI?</h2>
                    <p className="mb-6">
                        Digi-Vote AI is a next-generation election platform built to eliminate election fraud with advanced AI face verification,
                        ensure only eligible students vote, provide real-time results, and create a smooth experience for everyone on campus.
                    </p>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">Why Choose Digi-Vote AI?</h2>
                    <ul className="list-disc list-inside mb-6">
                        <li><strong>Security:</strong> OTP and AI face verification prevent proxy voting and multiple submissions.</li>
                        <li><strong>Transparency:</strong> Real-time vote updates for complete election clarity.</li>
                        <li><strong>Easy to Use:</strong> Accessible on any device, designed for fast and smooth voting.</li>
                        <li><strong>Smart Support:</strong> Built-in AI assistance for voters and admins alike.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">How Digi-Vote Works</h2>
                    <ol className="list-decimal list-inside mb-6">
                        <li>Register using your university email.</li>
                        <li>Verify your identity with OTP and AI face verification.</li>
                        <li>Cast your vote securely in a few clicks.</li>
                        <li>Track results live as votes are counted instantly.</li>
                    </ol>

                    <h2 className="text-2xl font-semibold mt-10 mb-4">For Students & Institutions</h2>
                    <p className="mb-4"><strong>Students:</strong> Participate in elections confidently—no long lines, no confusion.</p>
                    <p className="mb-8"><strong>Administrators:</strong> Manage elections centrally with voter lists, secure access, and reporting tools.</p>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
