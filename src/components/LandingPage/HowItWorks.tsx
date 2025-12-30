import React from "react";

export default function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Register",
      desc: "Sign up with your university email and verify your identity through OTP and facial recognition.",
    },
    {
      num: "2",
      title: "Verify",
      desc: "Our AI system verifies your face at login to ensure secure access to the voting platform.",
    },
    {
      num: "3",
      title: "Vote",
      desc: "Cast your vote for your preferred candidates across multiple election categories in one session.",
    },
    {
      num: "4",
      title: "Track",
      desc: "View real-time results and receive email notifications when final results are published.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-24 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500"
    >
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 text-white animate-fade-in-up">
          <h2 className="text-5xl md:text-6xl font-black mb-4">How It Works</h2>
          <p className="text-xl font-light">
            Simple steps to participate in university elections
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl text-4xl font-black text-indigo-600 group-hover:scale-110 transition-transform">
                {step.num}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 text-center">
                {step.title}
              </h3>
              <p className="text-white/90 leading-relaxed text-center">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
