import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({children})=>{
    const { user,isInitialized,loading} = useSelector((state) => state.auth) 

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

  console.log("User-ProtectedRoute:",user)
  // Redirect to auth if no user is logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Render the protected component if user is authenticated
  return children;
};

export default ProtectedRoute;