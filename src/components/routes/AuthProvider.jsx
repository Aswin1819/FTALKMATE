import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom'; // Make sure you have react-router-dom
import { getCurrentUser } from '../../features/auth/authSlice';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isInitialized, loading, user } = useSelector((state) => state.auth);

  // Define routes that don't need authentication check
  const publicRoutes = ['/', '/auth', '/register', '/otp-verification', '/about', '/contact'];
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(location.pathname);
  console.log(isPublicRoute)

  useEffect(() => {
    // Only fetch user if:
    // 1. Not already initialized
    // 2. Not on a public route (unless we think user might be logged in)
    // 3. OR if we have some indication that user might be logged in
    
    if (!isInitialized && !isPublicRoute) {
      // Only call getCurrentUser on protected routes
      dispatch(getCurrentUser());
    } else if (!isInitialized && isPublicRoute) {
      // For public routes, check if cookies exist before making the call
      const hasAuthCookies = document.cookie.includes('access_token') || 
                            document.cookie.includes('refresh_token');
      
      if (hasAuthCookies) {
        // If cookies exist, user might be logged in, so check
        dispatch(getCurrentUser());
      } else {
        // No cookies, user is definitely not logged in
        // Mark as initialized without making API call
        dispatch({ type: 'auth/setInitialized' }); // You'll need to add this action
      }
    }
  }, [dispatch, isInitialized, isPublicRoute]);

  // Show loading spinner only for protected routes or when we know we're checking auth
  if (!isInitialized && loading && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return children;
};

export default AuthProvider;