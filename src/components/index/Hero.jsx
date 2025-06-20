import React from 'react';
import { Button } from "../ui/button";
import { Mic, Globe } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Hero = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user)
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Effects - Updated to match the purple gradient in the screenshot */}
      <div className="absolute inset-0 z-0">
        {/* Deep purple gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#13071D] via-[#321463] to-[#13071D]"></div>
        
        {/* Horizon line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
        
        {/* Floating 3D elements style from the screenshot */}
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-neon-purple/30 rounded-2xl filter blur-xl rotate-12 animate-pulse-glow"></div>
        <div className="absolute bottom-1/3 left-1/5 w-56 h-56 bg-neon-pink/20 rounded-2xl filter blur-xl -rotate-12 animate-pulse-glow" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-neon-blue/20 rounded-2xl filter blur-xl rotate-45 animate-pulse-glow" style={{animationDelay: '2.3s'}}></div>
      </div>

      {/* Content - Centered like in the screenshot */}
      <div className="container relative z-10 px-4 mx-auto text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Main headline - Large, bold, and prominent as in the screenshot */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-wide text-white">
            Speak Fluently.<br />
            <span className="text-gradient">Connect Globally.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mt-4">
            Practice live with real people. Anytime. Free.
          </p>
          
          {/* CTA buttons - kept the same buttons with their effects */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            {user?(
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-neon-purple hover:bg-neon-purple/90 text-white text-lg px-8 py-6 glow-purple w-full sm:w-auto transition-all duration-300 hover:scale-105 hover:glow-pink"
              size="lg"
            >
              See How It Works
            </Button>

            ):(

            <Button 
              onClick={() => navigate('/auth')}
              variant="outline" 
              className="border-neon-blue hover:bg-neon-blue/10 text-white text-lg px-8 py-6 w-full sm:w-auto transition-all duration-300 hover:glow-blue"
              size="lg"
            >
              Join for Free
            </Button>
            )}
          </div>
          
          {/* Stats - Kept from original hero component */}
          <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <p className="text-3xl md:text-4xl font-bold text-neon-blue glow-text-blue">100+</p>
              <p className="text-gray-400 text-sm md:text-base">Languages</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl md:text-4xl font-bold text-neon-purple glow-text-purple">10K+</p>
              <p className="text-gray-400 text-sm md:text-base">Daily Users</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl md:text-4xl font-bold text-neon-pink glow-text-pink">24/7</p>
              <p className="text-gray-400 text-sm md:text-base">Availability</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl md:text-4xl font-bold text-white">150+</p>
              <p className="text-gray-400 text-sm md:text-base">Countries</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;