import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { googleSignin } from './auth';
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { setUser } from '../features/auth/authSlice';
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleAuth = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

  const handleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    if (credential) {
      console.log('Google credential received');
      try {
        const data = await googleSignin(credential);
        console.log('Server response:', data);
        
        // Verify cookies are set
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        
        console.log('Cookies after Google login:', cookies);
        
        if (data.user) {
          dispatch(setUser(data.user));
          console.log('User state updated:', data.user);
          navigate('/dashboard');
        } else {
          console.error('No user data in response');
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Google login failed:', error.response?.data || error.message);
        alert('Login failed. Please try again.');
      }
    } else {
      console.error('No credential received from Google');
      alert('Google login failed. Please try again.');
    }
  };

  const handleFailure = (error) => {
    if (error && error.details) {
      console.warn('Google Login failed:', error.details);
    } else {
      console.error('Google Login Error:', error);
    }
    alert('Google login failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleFailure}
        // useOneTap
        // type="icon" // Make sure it's compact. You can remove this if you want default layout
        shape="circle" // Optional
        theme="filled_black" // Optional, looks better on dark backgrounds
        size="medium" // Or "medium"
        // width="100%" // Ensure it stretches like a button
        fill="currentColor"
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;