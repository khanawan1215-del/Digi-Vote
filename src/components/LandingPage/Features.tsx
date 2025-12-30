import React from "react";
import {
  FiShield,
  FiLock,
  FiTrendingUp,
  FiUsers,
  FiMessageCircle,
  FiSmartphone,
} from "react-icons/fi";

export default function Features() {
  const features = [
    {
      icon: FiShield,
      title: "AI Face Verification",
      desc: "Advanced facial recognition ensures only verified students can vote, eliminating proxy voting and fraud.",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: FiLock,
      title: "OTP Authentication",
      desc: "Multi-layer security with university email verification and one-time passwords for complete authenticity.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FiTrendingUp,
      title: "Real-Time Results",
      desc: "Watch live election results with interactive charts and graphs as votes are counted instantly.",
      color: "from-pink-500 to-red-500",
    },
    {
      icon: FiUsers,
      title: "Centralized Platform",
      desc: "One unified system for all university societies and student body elections across your campus.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: FiMessageCircle,
      title: "AI Chatbot Support",
      desc: "Get instant help and guidance throughout the voting process with our intelligent assistant.",
      color: "from-green-500 to-teal-500",
    },
    {
      icon: FiSmartphone,
      title: "Fast & Efficient",
      desc: "Quick voting experience with minimal load times and smooth interactions.",
      color: "from-pink-500 to-purple-500",
    },
  ];

  return (
    <section
      id="features"
      className="relative py-24 bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Why Choose Digi-Vote AI?
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Experience the future of university elections with cutting-edge
            technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
            >
              <div
                className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
