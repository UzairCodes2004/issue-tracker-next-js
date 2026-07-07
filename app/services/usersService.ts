import axiosInstance from "../axios/axios";
import { ENDPOINTS } from "../constants/endpoints";

export interface UserPayload {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface DeleteUserResponse {
  message: string;
  deletedUser: User;
}

export interface ForgotPasswordResponse {
  message: string;
  id?: number;
  name?: string;
  email?: string;
  resetToken?: string;
  tokenExpireAt?: string;
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

export const deleteUser = async (id: string): Promise<DeleteUserResponse> => {
  const res = await axiosInstance.delete<DeleteUserResponse>(ENDPOINTS.USER_BY_ID(id));
  return res.data;
};

export const forgotPassword = async(email: string): Promise<ForgotPasswordResponse> => {
  const res = await axiosInstance.post<ForgotPasswordResponse>(`${ENDPOINTS.AUTH}/forgot-password`, { email });
  return res.data;
}

export const resetPassword = async (email: string, token: string, newPassword: string) => {
  const res = await axiosInstance.post(`${ENDPOINTS.AUTH}/reset-password`, {
    email,
    token,
    newPassword,
  });
  return res.data;
};