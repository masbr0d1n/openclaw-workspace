/**
 * Authentication Types
 */

export type UserRole = 'superadmin' | 'admin' | 'user';

export interface PageAccess {
  dashboard?: boolean;
  channels?: boolean;
  videos?: boolean;
  composer?: boolean;
  users?: boolean;
  settings?: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  role: UserRole;
  page_access?: PageAccess;
  created_at: string;
  updated_at: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role?: UserRole;
  page_access?: PageAccess;
}

export interface UpdateUserInput {
  email?: string;
  full_name?: string;
  role?: UserRole;
  page_access?: PageAccess;
  is_active?: boolean;
  password?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface TokenPayload {
  sub: string; // user ID
  exp: number; // expiration time
  iat: number; // issued at
}
