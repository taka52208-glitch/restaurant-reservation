import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, LoginCredentials, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for development
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'customer@reservation.local': {
    password: 'Customer123!',
    user: {
      id: '1',
      email: 'customer@reservation.local',
      name: '山田 太郎',
      role: 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  'store@reservation.local': {
    password: 'Store123!',
    user: {
      id: '2',
      email: 'store@reservation.local',
      name: '鈴木 花子（店舗オーナー）',
      role: 'store',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  'admin@reservation.local': {
    password: 'Admin123!',
    user: {
      id: '3',
      email: 'admin@reservation.local',
      name: '管理者',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};

function getInitialAuthState(): AuthState {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');

  if (storedUser && storedToken) {
    return {
      user: JSON.parse(storedUser) as User,
      token: storedToken,
      isAuthenticated: true,
      isLoading: false,
    };
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(getInitialAuthState);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUser = MOCK_USERS[credentials.email];

    if (!mockUser || mockUser.password !== credentials.password) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    const token = 'mock-jwt-token-' + Date.now();

    if (credentials.rememberMe) {
      localStorage.setItem('user', JSON.stringify(mockUser.user));
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('user', JSON.stringify(mockUser.user));
      sessionStorage.setItem('token', token);
    }

    setState({
      user: mockUser.user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');

    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
