// User Types
export type UserRole = 'customer' | 'store' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'store';
}

// Restaurant Types
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  genre: string;
  area: string;
  imageUrl?: string;
  openingHours: string;
  closingDays?: string;
  status: 'active' | 'pending' | 'inactive';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seat {
  id: string;
  restaurantId: string;
  name: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

// Reservation Types
export type PaymentMethod = 'online' | 'onsite';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type ReservationStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Reservation {
  id: string;
  restaurantId: string;
  userId: string;
  date: string;
  time: string;
  partySize: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: ReservationStatus;
  amount: number;
  stripePaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
