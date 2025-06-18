import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const { admin, isInitialized} = useSelector((state) => state.admin);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#13071D] to-[#2D1457]">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
          <span className="absolute text-neon-purple font-semibold text-lg">TM</span>
        </div>
      </div>
    );
  }

  if (!admin || !admin.is_superuser) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;