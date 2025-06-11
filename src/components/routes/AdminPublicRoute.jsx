// import React from 'react';
// import { useSelector } from 'react-redux';
// import { Navigate } from 'react-router-dom';

// const AdminPublicRoute = ({ children }) => {
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
//         <span className="ml-2">Loading...</span>
//       </div>
//     );
//   }

//   // If admin is already logged in, redirect to admin dashboard
//   // Adjust this condition based on your admin logic
//   if (user && user.is_staff) {
//     return <Navigate to="/admin/dashboard" replace />;
//   }

//   // Render the public admin component (like admin login page)
//   return children;
// };

// export default AdminPublicRoute;