import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'}/auth/login`, {
        email,
        password,
      });
     
      
      const {token,user } = response.data.data;
     
      
      
      // Store token in localStorage
      localStorage.setItem('user',JSON.stringify(user));
      localStorage.setItem('token', token);
      
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      
      if (!auth.token) {
        return rejectWithValue('No token found');
      }
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'}/auth/me`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear localStorage first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Try to call logout endpoint, but don't fail if it errors
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'}/auth/logout`);
      } catch (err) {
        // Ignore logout endpoint errors - we've already cleared local storage
        console.log('Logout endpoint error (ignored):', err);
      }
      
      return null;
    } catch (error: any) {
      // Even if there's an error, we should still clear the state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
        localStorage.removeItem('token');
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;