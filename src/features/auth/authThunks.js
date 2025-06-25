import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axiosInstance";

// Register User
export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/register/', formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Login User - USE AXIOSINSTANCE instead of axios
export const loginUser = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/login/', formData);
      console.log("Response from loginUser:", response.data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

//verify otp
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/verify-otp/', { email, code:otp });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

//resend otp
export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/resend-otp/', { email });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

//logout user
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, {rejectWithValue}) =>{
        try{
            await axiosInstance.post('/logout/');
            return true;
        }catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

//get current user - REMOVE DUPLICATE, use fetchUserProfile
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/profile/'); // Use /profile/ instead of /current-user/
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch user' });
    }
  }
);

// Verify Password Reset OTP
export const verifyPasswordResetOtp = createAsyncThunk(
  'auth/verifyPasswordResetOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/verify-password-reset-otp/', { email, code: otp });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Resend Password Reset OTP
export const resendPasswordResetOtp = createAsyncThunk(
  'auth/resendPasswordResetOtp',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/resend-password-reset-otp/', { email });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Reset Password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/reset-password/', { email, password });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Password reset failed' });
    }
  }
);

// Fetch User Profile
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try{
      const response = await axiosInstance.get('/profile/');
      return response.data;
    }catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch user profile'});
    }
  }
);

// Update user profile (avatar, bio)
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch('/profile/update/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to update profile' });
    }
  }
);