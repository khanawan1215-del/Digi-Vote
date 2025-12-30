"use client";
import React, { useEffect, useState, useRef } from "react";

export default function Stats() {
  const stats = [
    { stat: 90, label: "Security Rate", suffix: "%" },
    { stat: 50, label: "Active Students", suffix: "+" },
    { stat: 20, label: "Universities", suffix: "+" },
    { stat: 100, label: "Transparency", suffix: "%" },
  ];

  const [counts, setCounts] = useState(stats.map(() => 0));
  const sectionRef = useRef<HTMLElement>(null);
  const [hasCounted, setHasCounted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || hasCounted) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
      if (isVisible) {
        animateCounts();
        setHasCounted(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasCounted]);

  const animateCounts = () => {
    const duration = 2000; // animation duration in ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCounts(
        stats.map((s) => Math.floor(s.stat * progress))
      );
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-24 bg-gradient-to-br from-cyan-400 to-blue-500"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 text-center border-2 border-white/30 hover:bg-white/30 transition-all hover:scale-105"
            >
              <h3 className="text-6xl font-black text-white mb-2">
                {counts[index]}
                {item.suffix}
              </h3>
              <p className="text-xl text-white font-semibold">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
