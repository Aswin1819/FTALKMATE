// import React from 'react';
// import { Route, Navigate } from 'react-router-dom';
// import AdminLogin from '../pages/admin/AdminLogin';
// import AdminLayout from '../components/admin/AdminLayout';
// import AdminDashboard from '../pages/admin/Dashboard';
// import UserManagement from '../pages/admin/UserManagement';
// import AdminProtectedRoute from '../components/AdminProtectedRoute';
// import AdminPublicRoute from '../components/AdminPublicRoute';

// const AdminRoutes = () => {
//   return (
//     <>
//       {/* Admin Login Route - Only accessible when admin not logged in */}
//       <Route 
//         path="/admin/login" 
//         element={
//           <AdminPublicRoute>
//             <AdminLogin />
//           </AdminPublicRoute>
//         } 
//       />
      
//       {/* Protected Admin Routes - Only accessible when admin logged in */}
//       <Route 
//         path="/admin" 
//         element={
//           <AdminProtectedRoute>
//             <AdminLayout />
//           </AdminProtectedRoute>
//         }
//       >
//         <Route index element={<Navigate to="/admin/dashboard" replace />} />
//         <Route path="dashboard" element={<AdminDashboard />} />
//         <Route path="users" element={<UserManagement />} />
//         {/* Add more admin routes here */}
//       </Route>
//     </>
//   );
// };

// export default AdminRoutes;