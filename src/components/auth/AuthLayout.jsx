import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, illustration, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full">
      {/* Left panel with illustration */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-[#13071D] via-[#321463] to-[#13071D] p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-neon-purple/20 filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-neon-blue/20 filter blur-3xl"></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 z-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                opacity: Math.random() * 0.5 + 0.2,
                animation: `float ${Math.random() * 10 + 15}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Illustration section */}
        <div className="z-10 w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            {illustration}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-8 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h1>
            <p className="text-gray-300">{subtitle}</p>
          </motion.div>
        </div>
      </div>

      {/* Right panel with form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-[#13071D]">
        <div className="w-full max-w-md glass-morphism p-8 rounded-2xl border border-white/10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
