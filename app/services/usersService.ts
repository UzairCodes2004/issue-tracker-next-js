import axiosInstance from "../axios/axios";
import { ENDPOINTS } from "../constants/endpoints";

export interface UserPayload {
  name: string;
  email: string;
  password: string;
}


export const getUsers = async () => {
  const res = await axiosInstance.get(ENDPOINTS.USERS);
  return res.data;
};

export const getUserById = async (id: string) => {
  const res = await axiosInstance.get(ENDPOINTS.USER_BY_ID(id));
  return res.data;
};

export const createUser = async (user: UserPayload) => {
  const res = await axiosInstance.post(ENDPOINTS.USERS, user);
  return res.data;
};

export const updateUser = async (id: string, updatedUser: UserPayload) => {
  const res = await axiosInstance.put(ENDPOINTS.USER_BY_ID(id), updatedUser);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await axiosInstance.delete(ENDPOINTS.USER_BY_ID(id));
  return res.data;
};

