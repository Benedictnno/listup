import {api} from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    roles: string[];
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  roles: string[];
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  }
};

export default authService;