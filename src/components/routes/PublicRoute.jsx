import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const { user, isInitialized, loading } = useSelector((state) => state.auth);
  console.log("User-PublicRoute:",user)

  // Show loading while checking authentication status
   if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#13071D] to-[#2D1457]">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
          <span className="absolute text-neon-purple font-semibold text-lg">TM</span>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if user is already logged in
  if (user && user.is_verified ) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render the public component if no user is logged in
  return children;
};

export default PublicRoute;