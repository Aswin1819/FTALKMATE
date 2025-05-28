
import React from 'react';
import { Button } from "../ui/button";

const Premium = () => {
  return (
    <section id="premium" className="py-20 relative bg-[#0c0812]">
      {/* Curved top transition */}
      <div className="absolute top-0 left-0 w-full h-24 bg-background rounded-b-[100%] transform translate-y-[-50%]"></div>
      
      <div className="container mx-auto px-4 pt-8">
        <div className="text-center mb-16 scroll-animate">
          <h2 className="text-gradient-purple mb-4">Upgrade Your Experience</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Take your language learning to the next level with premium features.
          </p>
        </div>

        <div className="max-w-5xl mx-auto relative scroll-animate">
          {/* Gradient background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-neon-pink/20 to-neon-blue/20 rounded-2xl blur-xl"></div>
          
          <div className="relative glass-morphism rounded-2xl p-8 md:p-12 overflow-hidden">
            {/* Corner decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/30 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-neon-blue/20 rounded-tr-full"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4 text-gradient-purple">SpeakLink Premium</h3>
                <ul className="space-y-5 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon-purple text-xs font-medium text-white ring-1 ring-inset ring-white/10 glow-purple">✓</span>
                    <span className="text-gray-200">Private speaking rooms for personalized practice</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon-pink text-xs font-medium text-white ring-1 ring-inset ring-white/10 glow-pink">✓</span>
                    <span className="text-gray-200">Book professional tutors at discounted rates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon-blue text-xs font-medium text-white ring-1 ring-inset ring-white/10 glow-blue">✓</span>
                    <span className="text-gray-200">2x XP boost for faster progress and leveling</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon-purple text-xs font-medium text-white ring-1 ring-inset ring-white/10 glow-purple">✓</span>
                    <span className="text-gray-200">Advanced AI speech analysis and improvement tips</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon-pink text-xs font-medium text-white ring-1 ring-inset ring-white/10 glow-pink">✓</span>
                    <span className="text-gray-200">No advertisements during practice sessions</span>
                  </li>
                </ul>
                <Button className="bg-neon-purple hover:bg-neon-purple/90 text-white glow-purple px-8 py-6 text-lg hover:scale-105 hover:glow-pink transition-all duration-300">
                  Go Premium
                </Button>
                <p className="text-gray-400 text-sm mt-3">Starting at $8.99/month — Cancel anytime</p>
              </div>
              
              <div className="relative">
                <div className="aspect-square max-w-sm mx-auto hover-scale">
                  <img 
                    src="https://placehold.co/400/1A1F2C/FFFFFF/png?text=Premium+Features" 
                    alt="Premium features illustration" 
                    className="w-full h-auto rounded-xl glass-morphism p-2"
                  />
                  <div className="absolute -top-4 -right-4 bg-neon-pink text-white text-xs rounded-full px-3 py-1 font-bold rotate-12 glow-pink">
                    50% OFF
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Curved bottom transition */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-background rounded-t-[100%] transform translate-y-[50%]"></div>
    </section>
  );
};

export default Premium;
