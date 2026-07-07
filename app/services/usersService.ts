import axiosInstance from "../axios/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { isAxiosError } from "axios";

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

export interface UserPayload {
  name: string;
  email: string;
  password: string;
}

export interface User {
  message: string;
  id: number;
  name: string;
  email: string;
  resetToken:string;
  tokenExpireAt:string
}

export const getUsers = async (): Promise<User[]> => {
  const res = await axiosInstance.get<User[]>(ENDPOINTS.USERS);
  return res.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const res = await axiosInstance.get<User>(ENDPOINTS.USER_BY_ID(id));
  return res.data;
};

export const createUser = async (user: UserPayload): Promise<User> => {
  const res = await axiosInstance.post<User>(ENDPOINTS.USERS, user);
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

export const forgotPassword = async(email:string): Promise<User>=>{
  const res = await axiosInstance.post<User>(`${ENDPOINTS.AUTH}/forgot-password`, { email });
  return res.data;
}

export const validateResetToken = async (email: string, token: string) => {
  const res = await axiosInstance.post(`${ENDPOINTS.AUTH}/validate-reset-token`, {
    email,
    token,
  });
  return res.data;
};

export const resetPassword = async (email: string, token: string, newPassword: string) => {
  const res = await axiosInstance.post(`${ENDPOINTS.AUTH}/reset-password`, {
    email,
    token,
    newPassword,
  });
  return res.data;
};