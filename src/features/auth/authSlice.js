import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from './axiosInstance';

// Adjust baseURL as needed
const API_URL = 'http://127.0.0.1:8000/api/users';

// Register User
export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/register/`, formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Login User
export const loginUser = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login/`, formData,
        {
            withCredentials: true,
        }
      );
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
      const response = await axios.post(`${API_URL}/verify-otp/`, { email, code:otp });
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
      const response = await axios.post(`${API_URL}/resend-otp/`, { email });
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
            await axios.post(`${API_URL}/logout/`,
                {},
                {
                    withCredentials : true
                }
            );
            return true;
        }catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

//get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/current-user/`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch user' });
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
        state.user = action.payload.user
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state)=>{
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
        });


  },
});

export const { logout,clearError,setInitialized  } = authSlice.actions;
export default authSlice.reducer;

