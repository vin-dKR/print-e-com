/**
 * Authentication API functions
 */

import { post, get, ApiResponse } from '../api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  supabaseId?: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  createdAt: string;
  updatedAt?: string;
  addresses?: any[];
}

export interface AuthResponse {
  user: User;
  token?: string; // Optional - may not be present if email confirmation is required
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
  return post<AuthResponse>('/auth/register', data);
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
  return post<AuthResponse>('/auth/login', credentials);
}

/**
 * Get current user profile (requires authentication)
 */
export async function getProfile(): Promise<ApiResponse<User>> {
  return get<User>('/auth/user/profile');
}

