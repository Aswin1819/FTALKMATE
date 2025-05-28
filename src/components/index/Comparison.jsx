import React from 'react';

const Comparison = () => {
  return (
    <section id="comparison" className="py-20 relative bg-[#0c0812]">
      {/* Curved top transition */}
      <div className="absolute top-0 left-0 w-full h-24 bg-background rounded-b-[100%] transform translate-y-[-50%]"></div>
      
      <div className="container mx-auto px-4 pt-8">
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-gradient-purple mb-4">How We Compare</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            See why language learners are switching to our platform for more effective practice.
          </p>
        </div>

        <div className="overflow-x-auto glass-morphism rounded-xl p-6 scroll-animate">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-6 text-left">Features</th>
                <th className="py-4 px-6 text-center bg-neon-purple/10 rounded-t-lg">
                  <div className="text-xl font-bold text-white">SpeakLink</div>
                  <div className="text-sm text-neon-purple glow-text-purple">Our Platform</div>
                </th>
                <th className="py-4 px-6 text-center">
                  <div className="text-xl font-bold text-gray-400">Free4Talk</div>
                </th>
                <th className="py-4 px-6 text-center">
                  <div className="text-xl font-bold text-gray-400">Others</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-4 px-6 text-gray-300">Live Video Rooms</td>
                <td className="py-4 px-6 text-center bg-neon-purple/5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neon-purple text-white glow-purple">✓</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white">✓</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white">✓</span>
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-4 px-6 text-gray-300">AI-Powered Feedback</td>
                <td className="py-4 px-6 text-center bg-neon-purple/5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neon-purple text-white glow-purple">✓</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white">✗</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white">✗</span>
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-4 px-6 text-gray-300">XP & Gamification</td>
                <td className="py-4 px-6 text-center bg-neon-purple/5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neon-purple text-white glow-purple">✓</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white">✗</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white">✗</span>
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-4 px-6 text-gray-300">Topic-Based Rooms</td>
                <td className="py-4 px-6 text-center bg-neon-purple/5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neon-purple text-white glow-purple">✓</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white">✓</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white">✗</span>
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-4 px-6 text-gray-300">AI Moderation</td>
                <td className="py-4 px-6 text-center bg-neon-purple/5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neon-purple text-white glow-purple">✓</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white">✗</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white">✗</span>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-gray-300">Always Free Tier</td>
                <td className="py-4 px-6 text-center rounded-b-lg bg-neon-purple/5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neon-purple text-white glow-purple">✓</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white">✓</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white">✗</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Curved bottom transition */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-background rounded-t-[100%] transform translate-y-[50%]"></div>
    </section>
  );
};

export default Comparison;
