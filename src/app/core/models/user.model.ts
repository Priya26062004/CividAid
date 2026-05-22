import { Role, UserStatus } from './role.enum';

/** POST /auth/register request */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
}

/** POST /auth/register response */
export interface RegisterResponse {
  userId: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

/** POST /auth/login request */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /auth/login response */
export interface LoginResponse {
  token: string;
  email: string;
  role: string;
  userId?: number;
}

/** GET /users/email/{email} response */
export interface UserDto {
  email: string;
  role: Role;
  password?: string;
}

/** GET /users/{id} | GET /users/getallusers response item */
export interface UserResponse {
  userId: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
