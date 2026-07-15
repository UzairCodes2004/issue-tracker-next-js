import axiosInstance from "../axios/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { isAxiosError } from "axios";
import { Role } from "../lib/auth/role"; 


export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message.join(", ");
    }
    if (typeof message === "string") {
      return message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UserPayload {
  name: string;
  email: string;
  password: string;
}

// Extended payload for registration (includes role request)
export interface RegisterPayload extends UserPayload {
  requestedRole?: Role;      
  managerReason?: string;   
}

export interface User {
  message?: string;
  id: number;
  name: string;
  email: string;
  role?: string;            
  resetToken?: string;
  tokenExpireAt?: string;
}

// ─── API Functions ──────────────────────────────────────────────────────────

export const getUsers = async (): Promise<User[]> => {
  const res = await axiosInstance.get<User[]>(ENDPOINTS.USERS);
  return res.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const res = await axiosInstance.get<User>(ENDPOINTS.USER_BY_ID(id));
  return res.data;
};

// 
// This function calls the generic POST /users – not for registration.
// Keep it if you have other user creation needs, but registration should use registerUser.
export const createUser = async (user: UserPayload): Promise<User> => {
  const res = await axiosInstance.post<User>(ENDPOINTS.USERS, user);
  return res.data;
};

// ─── NEW: Registration endpoint (calls /users/register) ──────────────────
export const registerUser = async (payload: RegisterPayload): Promise<User> => {
  const res = await axiosInstance.post<User>(`${ENDPOINTS.USERS}/register`, payload);
  return res.data;
};

export const updateUser = async (
  id: string,
  updatedUser: Partial<UserPayload>
): Promise<User> => {
  const res = await axiosInstance.put<User>(ENDPOINTS.USER_BY_ID(id), updatedUser);
  return res.data;
};

export const deleteUser = async (id: string): Promise<User> => {
  const res = await axiosInstance.delete<User>(ENDPOINTS.USER_BY_ID(id));
  return res.data;
};

export const forgotPassword = async (email: string): Promise<User> => {
  const res = await axiosInstance.post<User>(`${ENDPOINTS.AUTH}/forgot-password`, { email });
  return res.data;
};

export const validateResetToken = async (data: string): Promise<{ valid: boolean; email?: string }> => {
  const res = await axiosInstance.post<{ valid: boolean; email?: string }>(
    `${ENDPOINTS.AUTH}/validate-reset-token`,
    { data }
  );
  return res.data;
};

export const resetPassword = async (data: string, newPassword: string) => {
  const res = await axiosInstance.post(`${ENDPOINTS.AUTH}/reset-password`, {
    data,
    newPassword,
  });
  return res.data;
};