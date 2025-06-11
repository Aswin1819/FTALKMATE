import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({children})=>{
    const { user,isInitialized,loading} = useSelector((state) => state.auth) 
  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Redirect to auth if no user is logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Render the protected component if user is authenticated
  return children;
};

export default ProtectedRoute;