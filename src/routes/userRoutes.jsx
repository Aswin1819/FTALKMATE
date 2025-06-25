import React from 'react';
import { Route } from 'react-router-dom';
import Index from '../pages/user/Index';
import Auth from '../pages/user/Auth';
import OTPVerification from '../pages/user/OTPVerification';
import Dashboard from '../pages/user/dashboard/Dashboard';
import DashboardHome from '../pages/user/dashboard/DashboardHome';
import UserProfile from '../pages/user/dashboard/UserProfile';
import ResetPassword from '../pages/user/ResetPassword';
import ProtectedRoute from '../components/routes/ProtectedRoute';
import PublicRoute from '../components/routes/PublicRoute';
import Settings from '../pages/user/dashboard/Settings';
import DashboardExplore from '../pages/user/dashboard/DashboardExplore';
import LiveRoom from '../pages/user/dashboard/LiveRoom';

const userRoutes = [
  <Route path='/' element={<Index />} key="home" />,
  <Route 
    path="/auth" 
    element={<PublicRoute><Auth /></PublicRoute>} 
    key="auth"
  />,
  <Route 
    path="/otp-verification" 
    element={<PublicRoute><OTPVerification /></PublicRoute>} 
    key="otp"
  />,
  <Route
    path="/reset-password"
    element={<PublicRoute><ResetPassword /></PublicRoute>}
    key="reset-password"
  />,
  <Route 
    path="/dashboard" 
    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
    key="dashboard"
  >
    <Route index element={<DashboardHome />} />
    <Route path="profile" element={<UserProfile />} />
    <Route path='settings' element={<Settings/>}/>
    <Route path='explore' element={<DashboardExplore/>} />
  </Route>,
    <Route path='room/:roomId' element={<LiveRoom/>}/>
];

export default userRoutes;