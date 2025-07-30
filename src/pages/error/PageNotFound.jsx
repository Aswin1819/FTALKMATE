import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Home, ArrowLeft, Search, Users, LogIn } from 'lucide-react';
import { useSelector } from 'react-redux';

const PageNotFound = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A0E29] to-[#2D1B4E] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* 404 Number */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-8xl font-bold bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            404
          </motion.div>

          {/* Error Message */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-white mb-2"
          >
            Page Not Found
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/70 mb-8"
          >
            The page you're looking for doesn't exist or has been moved.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => navigate('/dashboard/explore')}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-violet-500/25"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Explore
                </Button>

                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="w-full bg-transparent border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:border-violet-400"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/')}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-violet-500/25"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>

                <Button
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  className="w-full bg-transparent border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:border-violet-400"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </>
            )}
          </motion.div>

          {/* Additional Navigation */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="mt-8 pt-6 border-t border-white/10"
            >
              <p className="text-white/50 text-sm mb-4">Quick Navigation</p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Home className="mr-1 h-3 w-3" />
                  Dashboard
                </Button>
                <Button
                  onClick={() => navigate('/dashboard/explore')}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Search className="mr-1 h-3 w-3" />
                  Explore
                </Button>
                <Button
                  onClick={() => navigate('/dashboard/profile')}
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Users className="mr-1 h-3 w-3" />
                  Profile
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PageNotFound; 