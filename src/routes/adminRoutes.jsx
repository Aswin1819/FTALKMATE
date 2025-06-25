import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import UserManagement from '../pages/admin/UserManagement';
import AdminProtectedRoute from '../components/routes/AdminProtectedRoute';
import AdminPublicRoute from '../components/routes/AdminPublicRoute';
import TaxonomyManagement from '../pages/admin/TaxonomyManagement';
import RoomManagement from '../pages/admin/RoomManagement';

const adminRoutes = [
  // Admin Login Route - Only accessible when admin not logged in
  <Route 
    path="/admin/login" 
    element={
      <AdminPublicRoute>
        <AdminLogin />
      </AdminPublicRoute>
    } 
    key="admin-login"
  />,
  // Protected Admin Routes - Only accessible when admin logged in
  <Route 
    path="/admin" 
    element={
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    }
    key="admin-root"
  >
    <Route index element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="users" element={<UserManagement />} />
    <Route path="taxonomy" element={<TaxonomyManagement/>}/>
    <Route path="rooms" element={<RoomManagement/>}/>
    {/* Add more admin routes here */}
  </Route>,
];

export default adminRoutes;