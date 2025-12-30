import React from "react";
import { FiUsers } from "react-icons/fi";
import Image from 'next/image';
import Link from 'next/link';


export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20">
      <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-delayed"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="text-white space-y-8 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              Revolutionize University Elections with AI
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-light">
              A secure, transparent, and corruption-free voting platform powered
              by artificial intelligence. Vote from anywhere, anytime with
              complete confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="px-4 py-2 sm:px-8 sm:py-4 bg-white text-indigo-600 rounded-full font-bold text-sm sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
              >
                Get Started
              </Link>
              <Link
                href="/learn"
                className="px-4 py-2 sm:px-8 sm:py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-bold text-sm sm:text-lg border-2 border-white hover:bg-white hover:text-indigo-600 transition-all"
              >
                Learn More
              </Link>
            </div>


          </div>

          {/* Right*/}
          <div className="py-4 relative animate-fade-in-up-delayed">
            <div className="relative transform hover:rotate-0 rotate-2 transition-transform duration-500">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg rounded-3xl border-4 border-white/30 shadow-2xl overflow-hidden">
                {/* Display the image filling the container */}
                <Image
                  src="/images/hero.png"
                  alt="Hero Image"
                  fill // makes the image fill the parent container
                  style={{ objectFit: 'cover' }} // ensures image covers container without stretching
                  className="rounded-3xl" // match container rounding
                />
              </div>
            </div>

            <div className="hidden md:block absolute -top-4 -left-4 bg-white rounded-2xl p-4 shadow-xl animate-float">
              <div className="text-3xl mb-2">🔒</div>
              <div className="text-sm font-bold text-indigo-600">
                100% Secure
              </div>
            </div>
            <div className="hidden md:block absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl animate-float-delayed">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm font-bold text-indigo-600">
                Real-Time Results
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
