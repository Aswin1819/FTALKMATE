import { createSlice } from '@reduxjs/toolkit';
import { 
  getCurrentUser,
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  logoutUser,
  verifyPasswordResetOtp,
  resendPasswordResetOtp,
  resetPassword
} from './authThunks';



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

