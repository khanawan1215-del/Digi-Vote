// app/about/page.tsx
"use client";

import React from "react";
import Navbar from "@/components/LandingPage/Navbar";
import Footer from "@/components/LandingPage/Footer";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
            {/* Navbar */}
            <Navbar />

            {/* Page content */}
            <main className="pt-28 flex flex-col space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <section className="text-center">
                    <h1 className="text-5xl md:text-6xl font-black mb-6">
                        About Digi-Vote AI
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-white/90">
                        Digi-Vote AI is designed to revolutionize university elections. Our platform
                        provides secure, transparent, and AI-powered voting solutions for students
                        and faculty alike.
                    </p>
                </section>

                {/* Mission & Vision */}
                <section className="grid md:grid-cols-2 gap-12">
                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500">
                        <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                        <p>
                            To provide a transparent, fair, and efficient voting system for universities
                            using cutting-edge AI technology. We aim to eliminate election fraud and
                            empower student communities.
                        </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500">
                        <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                        <p>
                            To create a future where student elections are fully automated, secure,
                            and accessible to all students, promoting trust and engagement in campus
                            governance.
                        </p>
                    </div>
                </section>

                {/* Team Section */}
                <section>
                    <h2 className="text-4xl font-black mb-12 text-center">Meet the Team</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500">
                            <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                                👩‍💻
                            </div>
                            <h3 className="font-bold text-xl mb-2">Alice Johnson</h3>
                            <p className="text-white/90 text-sm">Lead Developer</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500">
                            <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                                🧑‍🎨
                            </div>
                            <h3 className="font-bold text-xl mb-2">Mark Smith</h3>
                            <p className="text-white/90 text-sm">UI/UX Designer</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500">
                            <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                                🤖
                            </div>
                            <h3 className="font-bold text-xl mb-2">Sara Lee</h3>
                            <p className="text-white/90 text-sm">AI Specialist</p>
                        </div>
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
