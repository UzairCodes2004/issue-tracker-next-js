import axiosInstance from "../axios/axios";
import { ENDPOINTS } from "../constants/endpoints";

// ─── User Payload Type ────────────────────────────────────────────────────────
// Describes the fields we send to the backend when creating or updating a user.
// Keeping the type here means every form that deals with users imports from one place.
export interface UserPayload {
  name: string;
  email: string;
  password: string;
}

// ─── GET all users ────────────────────────────────────────────────────────────
// Returns a list of all registered users.
export const getUsers = async () => {
  const res = await axiosInstance.get(ENDPOINTS.USERS);
  return res.data;
};

// ─── GET one user by ID ───────────────────────────────────────────────────────
// Returns a single user object (without password) matching the given ID.
export const getUserById = async (id: string) => {
  const res = await axiosInstance.get(ENDPOINTS.USER_BY_ID(id));
  return res.data;
};

// ─── POST create a new user (Register) ───────────────────────────────────────
// Sends name, email and password to the backend to register a new account.
export const createUser = async (user: UserPayload) => {
  const res = await axiosInstance.post(ENDPOINTS.USERS, user);
  return res.data;
};

// ─── PUT update an existing user ─────────────────────────────────────────────
// Sends updated user fields. The backend will hash the password before saving.
export const updateUser = async (id: string, updatedUser: UserPayload) => {
  const res = await axiosInstance.put(ENDPOINTS.USER_BY_ID(id), updatedUser);
  return res.data;
};

// ─── DELETE a user ────────────────────────────────────────────────────────────
// Permanently removes the user account from the backend.
export const deleteUser = async (id: string) => {
  const res = await axiosInstance.delete(ENDPOINTS.USER_BY_ID(id));
  return res.data;
};

