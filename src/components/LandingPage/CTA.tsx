import React from "react";
import Link from 'next/link';
export default function CTA() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl md:text-6xl font-black mb-6">
          Ready to Transform Your Elections?
        </h2>
        <p className="text-xl mb-10 font-light">
          Join thousands of students already using Digi-Vote AI for fair and
          transparent elections
        </p>
        <Link
          href="/register"
          className="px-12 py-5 bg-white text-indigo-600 rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all">
          Start Voting Now
        </Link>
      </div>
    </section>
  );
}
