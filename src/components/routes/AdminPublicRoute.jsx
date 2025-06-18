import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate,useLocation } from 'react-router-dom';

const AdminPublicRoute = ({ children }) => {
  const { admin, isInitialized, loading } = useSelector((state) => state.admin);
  const locaction = useLocation();

  if (location.pathname == "/admin/login"){
    return children;
  }

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

  if (admin && admin.is_superuser) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default AdminPublicRoute;