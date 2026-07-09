import axios from "axios";
import axiosInstance from "../axios/axios";
import { ENDPOINTS } from "../constants/endpoints";


export type UserRole='USER'|'MANAGER'|'SUPERADMIN';
import {Issue} from './issuesService';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  registered: string;
  issues: { id: number; title: string; status: string }[];
  comments: { id: number; text: string; issueID: number }[];
}

export interface AdminIssue {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAT: string;
  updatedAT: string;
  userID: number;
  updatedByUserId: number | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  updatedByUser: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  comments: {
    id: number;
    text: string;
    createdAT: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }[];
}

export interface AdminComment {
  id: number;
  text: string;
  createdAT: string;
  updatedAT: string;
  userID: number;
  issueID: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  issue: {
    id: number;
    title: string;
    status: string;
  };
}

export interface DashboardStats {
  totalIssues: number;
  totalUsers: number;
  totalComments: number;
  issuesByStatus: { status: string; count: number }[];
  usersByRole: { role: string; count: number }[];
}

export interface UpdateUserRolePayload {
  role: UserRole;
}

// GET STATS AS ADMIN 
export const getAdminStats= async ():Promise <DashboardStats>=>{
    const res = await axiosInstance.get<DashboardStats>(ENDPOINTS.ADMIN_STATS);
    return res.data;
}
// GET ALL USERS 

export const getAdminUsers = async (): Promise <AdminUser[]> => {
const res = await axiosInstance.get<AdminUser[]>(ENDPOINTS.ADMIN_USERS);
return (await res).data;
};


// GET USER BY ID 
export const getUserById = async (id:string) :Promise<AdminUser> => {
    const res= await axiosInstance.get<AdminUser>(ENDPOINTS.ADMIN_USER_BY_ID(id));
    return res.data;
}

export const updateUserRole = async (id:string,role:UserRole):Promise<AdminUser>=>{
    const res = 
    axiosInstance.put(ENDPOINTS.ADMIN_USER_ROLE(id),{role});
    return (await res).data;
}


export const deleteUser = async (id: string): Promise<{ id: number; name: string; email: string }> => {
  const res = await axiosInstance.delete(ENDPOINTS.ADMIN_USER_BY_ID(id));
  return res.data;
};

// ─── Issues ────
export const getAllIssues = async (): Promise<AdminIssue[]> => {
  const res = await axiosInstance.get<AdminIssue[]>(ENDPOINTS.ADMIN_ISSUES);
  return res.data;
};

export const getAdminIssueById = async (id: string): Promise<AdminIssue> => {
  const res = await axiosInstance.get<AdminIssue>(ENDPOINTS.ADMIN_ISSUE_BY_ID(id));
  return res.data;
};

export const updateAdminIssue = async (id: string, payload: Issue): Promise<AdminIssue> => {
  const res = await axiosInstance.put<AdminIssue>(ENDPOINTS.ADMIN_ISSUE_BY_ID(id), payload);
  return res.data;
};

export const deleteAdminIssue = async (id: string): Promise<void> => {
  await axiosInstance.delete(ENDPOINTS.ADMIN_ISSUE_BY_ID(id));
};

// ─── Comments ───────────
export const getAllComments = async (): Promise<AdminComment[]> => {
  const res = await axiosInstance.get<AdminComment[]>(ENDPOINTS.ADMIN_COMMENTS);
  return res.data;
};

export const deleteAdminComment = async (id: string): Promise<void> => {
  await axiosInstance.delete(ENDPOINTS.ADMIN_COMMENT_BY_ID(id));
};