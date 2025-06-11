// import React from 'react';
// import { useSelector } from 'react-redux';
// import { Navigate } from 'react-router-dom';

// const AdminProtectedRoute = ({ children }) => {
//   // If you have separate admin auth state, use that
//   // For now, assuming you use the same auth state but check for admin role
//   const { user, isInitialized, loading } = useSelector((state) => state.auth);
  
//   // You might have separate admin auth state like:
//   // const { admin, isInitialized, loading } = useSelector((state) => state.adminAuth);

//   // Show loading while checking authentication status
//   if (!isInitialized || loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
//         <span className="ml-2">Checking admin access...</span>
//       </div>
//     );
//   }

//   // Check if user exists and has admin privileges
//   // Adjust this condition based on your admin logic
//   if (!user || !user.is_staff) {
//     // Redirect to admin login if not authenticated or not admin
//     return <Navigate to="/admin/login" replace />;
//   }

//   // Render the protected admin component
//   return children;
// };

// export default AdminProtectedRoute;