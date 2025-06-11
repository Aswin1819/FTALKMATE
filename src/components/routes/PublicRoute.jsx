import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const { user, isInitialized, loading } = useSelector((state) => state.auth);

  // Show loading while checking authentication status
  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading...</span>
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