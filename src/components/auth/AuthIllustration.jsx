import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const AuthIllustration = () => {
  return (
    <div className="relative w-full h-64 md:h-80 flex items-center justify-center">
      {/* Main globe */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 20,
          delay: 0.2 
        }}
        className="relative z-20"
      >
        <div className="bg-gradient-to-br from-neon-purple/80 to-neon-blue/80 p-10 rounded-full glow-purple">
          <Globe size={80} className="text-white" />
        </div>
      </motion.div>

      {/* Speech bubbles */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="absolute z-10 top-0 left-1/4 -translate-x-1/2 bg-neon-blue/90 px-4 py-2 rounded-2xl rounded-bl-none glow-blue"
      >
        <p className="text-white font-medium">Hello!</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute z-10 bottom-8 right-1/4 translate-x-1/2 bg-neon-purple/90 px-4 py-2 rounded-2xl rounded-br-none glow-purple"
      >
        <p className="text-white font-medium">¡Hola!</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute z-10 top-1/2 -translate-y-1/2 right-0 bg-neon-pink/90 px-4 py-2 rounded-2xl rounded-tr-none glow-pink"
      >
        <p className="text-white font-medium">Bonjour!</p>
      </motion.div>

      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 400 300">
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ delay: 1.2, duration: 1.5 }}
          d="M100,50 L200,150 L300,120"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="1000"
          strokeDashoffset="1000"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 rounded-full filter blur-3xl opacity-40"></div>
    </div>
  );
};

export default AuthIllustration;
