"use client";

import React from "react";
import Navbar from "@/components/LandingPage/Navbar";
import Footer from "@/components/LandingPage/Footer";
import { HiUserCircle, HiPresentationChartLine, HiShieldCheck } from "react-icons/hi2";


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      {/* Navbar — Overlays naturally, no space below */}
      <Navbar />

      {/* Main content section */}
      <div className="flex flex-1 relative ">
        {/* Left Side - Branding */}
        <div className="pt-22 pb-22 hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden p-20 text-white">
          <div className="absolute inset-0 bg-black/10 rounded-xl animate-pulse-slow" />
          <div className="animate-fade-in-up relative z-10 flex flex-col justify-center h-full">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              University Election System
            </h1>
            <p className="text-xl mb-8 animate-fade-in delay-200">
              Secure, transparent, and accessible voting for student societies
            </p>

            <div className="space-y-4">
              {[
                {
                  name: "Facial Recognition Security",
                  icon: HiUserCircle,
                },
                {
                  name: "Real-time Results",
                  icon: HiPresentationChartLine,
                },
                {
                  name: "Complete Transparency",
                  icon: HiShieldCheck,
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 animate-fade-in delay-[400ms]"
                >
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <span className="text-lg">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Blended Gradient */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 pt-40 pb-22 bg-gradient-to-br from-indigo-100 via-purple-300 to-purple-500 text-white relative">
          {/* Gradient overlay to blend the joining line */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-indigo-500 to-transparent rounded-r-3xl z-20" />
          <div className="w-full max-w-md z-30">{children}</div>
        </div>
      </div>

      {/* Footer - normal flow */}
      <Footer />
    </div>
  );
}
