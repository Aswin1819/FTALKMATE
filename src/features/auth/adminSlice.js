import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL (adjust as needed)
const API_BASE = 'http://127.0.0.1:8000/api/admin';

// Admin Login Thunk
export const adminLogin = createAsyncThunk(
  'admin/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/login/`, {
        email,
        password,
      });
      localStorage.setItem('adminToken', response.data.access);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

// Fetch Users Thunk
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE}/users/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Fetching users failed');
    }
  }
);

// Logout Action
export const adminLogout = createAsyncThunk('/logout/', async () => {
  localStorage.removeItem('adminToken');
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    admin: null,
    token: localStorage.getItem('adminToken') || null,
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = {
          username: action.payload.username,
          email: action.payload.email,
          user_id: action.payload.user_id,
          is_superuser: action.payload.is_superuser,
        };
        state.token = action.payload.access;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin Logout
      .addCase(adminLogout.fulfilled, (state) => {
        state.admin = null;
        state.token = null;
        state.users = [];
        state.error = null;
        state.loading = false;
      });
  },
});

export default adminSlice.reducer;
