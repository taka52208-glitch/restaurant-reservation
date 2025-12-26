import type { LoginCredentials, User } from '../types';
import { apiClient } from './client';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
    // Use JSON login endpoint
    const { data } = await apiClient.post<LoginResponse>('/auth/login/json', {
      email: credentials.email,
      password: credentials.password,
    });

    // Get user info with the token
    const userResponse = await apiClient.get<User>('/users/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });

    return {
      token: data.access_token,
      user: userResponse.data,
    };
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  },
};
