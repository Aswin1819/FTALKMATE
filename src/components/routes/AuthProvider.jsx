import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getCurrentUser } from '../../features/auth/authSlice';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isInitialized, loading } = useSelector((state) => state.auth);

  // List of public routes
  const publicRoutes = ['/', '/auth', '/register', '/otp-verification'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  useEffect(() => {
    if (!isInitialized) {
      // Always check user if not initialized
      const hasAuthCookies = document.cookie.includes('access_token') || document.cookie.includes('refresh_token');
      if (!isPublicRoute || hasAuthCookies) {
        dispatch(getCurrentUser());
      } else {
        // No cookies and on public route, mark as initialized
        dispatch({ type: 'auth/setInitialized' });
      }
    }
  }, [dispatch, isInitialized, isPublicRoute, location.pathname]);

  // Show spinner while loading
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

  return children;
};

export default AuthProvider;