import axiosInstance from "../axios/axios";
import { ENDPOINTS } from "../constants/endpoints";

// ─── Types ────────────────────────────────────────────────────────────────

export type ManagerRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ManagerRequest {
  id: number;
  userId: number;
  status: ManagerRequestStatus;
  notes: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateManagerRequestPayload {
  reason: string;
  experience?: string;
}

export interface ReviewManagerRequestPayload {
  action: "APPROVE" | "REJECT";
  notes?: string;
}

export interface ManagerRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

// ─── API Functions ────────────────────────────────────────────────────────

// ─── Create a manager request ────────────────────────────────────────────
export const createManagerRequest = async (
  payload: CreateManagerRequestPayload
): Promise<ManagerRequest> => {
  const res = await axiosInstance.post<ManagerRequest>(ENDPOINTS.MANAGER_REQUESTS, payload);
  return res.data;
};

// ─── Get all pending requests (SUPER_ADMIN only) ──────────────────────
export const getPendingManagerRequests = async (): Promise<ManagerRequest[]> => {
  const res = await axiosInstance.get<ManagerRequest[]>(ENDPOINTS.MANAGER_REQUESTS_PENDING);
  return res.data;
};

// ─── Get all requests (SUPER_ADMIN only) ────────────────────────────────
export const getAllManagerRequests = async (): Promise<ManagerRequest[]> => {
  const res = await axiosInstance.get<ManagerRequest[]>(ENDPOINTS.MANAGER_REQUESTS);
  return res.data;
};

// ─── Get current user's requests ─────────────────────────────────────────
export const getMyManagerRequests = async (): Promise<ManagerRequest[]> => {
  const res = await axiosInstance.get<ManagerRequest[]>(ENDPOINTS.MANAGER_REQUESTS_ME);
  return res.data;
};

// ─── Get requests for a specific user (SUPER_ADMIN only) ────────────────
export const getUserManagerRequests = async (userId: number): Promise<ManagerRequest[]> => {
  const res = await axiosInstance.get<ManagerRequest[]>(ENDPOINTS.MANAGER_REQUESTS_USER(userId));
  return res.data;
};

// ─── Review a request (SUPER_ADMIN only) ─────────────────────────────────
export const reviewManagerRequest = async (
  requestId: number,
  payload: ReviewManagerRequestPayload
): Promise<ManagerRequest> => {
  const res = await axiosInstance.put<ManagerRequest>(
    ENDPOINTS.MANAGER_REQUESTS_REVIEW(requestId),
    payload
  );
  return res.data;
};

// ─── Get request statistics (SUPER_ADMIN only) ──────────────────────────
export const getManagerRequestStats = async (): Promise<ManagerRequestStats> => {
  const res = await axiosInstance.get<ManagerRequestStats>(ENDPOINTS.MANAGER_REQUESTS_STATS);
  return res.data;
};