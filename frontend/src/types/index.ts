// User Types
export type UserRole = 'customer' | 'store' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
export interface Seat {
  id: string;
  name: string;
  capacity: number;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phone: string;
  email: string;
  genre: string;
  area: string;
  image_url?: string | null;
  opening_hours: string;
  closing_days?: string | null;
  status: 'active' | 'pending' | 'inactive';
  owner_id: string;
  seats?: Seat[];
  created_at: string;
  updated_at: string;
}

// Reservation Types
export type PaymentMethod = 'online' | 'onsite';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type ReservationStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Reservation {
  id: string;
  restaurant_id: string;
  customer_id: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: ReservationStatus;
  amount: number;
  stripe_payment_intent_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  restaurant_name?: string;
  customer_name?: string;
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
