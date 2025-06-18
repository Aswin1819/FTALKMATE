import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminInstance from './adminInstance';

// Admin Login Thunk
export const adminLogin = createAsyncThunk(
  'admin/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await adminInstance.post('/login/', { email, password });
      return response.data.admin;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

// Fetch Users Thunk
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminInstance.get('/users/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Fetching users failed');
    }
  }
);

// Logout Action
export const adminLogout = createAsyncThunk('admin/logout', async () => {
  await adminInstance.post('/logout/');
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    admin: null,
    loading: false,
    error: null,
    isInitialized: false, // Only set to false on first load if you want a splash screen
  },
  reducers: {
    setAdmin: (state, action) => {
      state.admin = action.payload;
      state.isInitialized = true;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.isInitialized = true;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.admin = null;
        state.error = null;
        state.loading = false;
        state.isInitialized = true;
      });
  },
});

export const { setAdmin, setInitialized } = adminSlice.actions;
export default adminSlice.reducer;