import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from './axiosInstance';



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

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isInitialized : false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;

    },
    clearError:(state)=>{
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentUser.pending, (state)=>{
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state,action)=>{
        state.loading = false;
        state.user = action.payload.user || action.payload; // Handle both user and profile response
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action)=>{
        state.loading = false;
        state.user = null;
        state.isInitialized = true;
        state.error = action.payload?.message || "Getting current user failed"
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isInitialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isInitialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isInitialized = true;
        })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'OTP verification failed';
        })
        .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        })
        .addCase(resendOtp.fulfilled, (state) => {
        state.loading = false;
        })
        .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to resend OTP';
        })
        .addCase(logoutUser.fulfilled, (state)=>{
            state.user = null;
            state.isInitialized = true;
        })
        .addCase(logoutUser.rejected, (state,action)=>{
            state.error = action.payload;
            state.user = null
            state.isInitialized = true;
        })
        .addCase(verifyPasswordResetOtp.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(verifyPasswordResetOtp.fulfilled, (state, action) => {
          state.loading = false;
          state.user = action.payload.user;
          state.isInitialized = true;
        })
        .addCase(verifyPasswordResetOtp.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || 'Password reset OTP verification failed';
        })
        .addCase(resendPasswordResetOtp.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(resendPasswordResetOtp.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(resendPasswordResetOtp.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || 'Failed to resend password reset OTP';
        })
        .addCase(resetPassword.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(resetPassword.fulfilled, (state, action) => {
          state.loading = false;
          state.user = action.payload.user;
          state.isInitialized = true;
        })
        .addCase(resetPassword.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || 'Password reset failed';
        });


  },
});

export const { logout,clearError,setInitialized,setUser  } = authSlice.actions;
export default authSlice.reducer;

