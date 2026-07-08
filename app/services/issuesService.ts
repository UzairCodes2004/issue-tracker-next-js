import axiosInstance from "../axios/axios";
import { ENDPOINTS } from "../constants/endpoints";


export type IssueStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

export interface UserBasic{
  email:string;
  name:string;
  role:string
}
export interface Issue {
  id: number;
  title: string;
  description: string;
  status: IssueStatus;
  userID:number;
  user:UserBasic;
  updatedByUser:UserBasic|null;
}


export interface IssuePayload {
  title: string;
  description: string;
  status?: IssueStatus;
}

// ─── GET all issues ───────────────────────────────────────────────────────────
export const getIssues = async (): Promise<Issue[]> => {
  const res = await axiosInstance.get<Issue[]>(ENDPOINTS.ISSUES);
  return res.data;
};

// ─── GET one issue by ID ──────────────────────────────────────────────────────
export const getIssueById = async (id: string): Promise<Issue> => {
  const res = await axiosInstance.get<Issue>(ENDPOINTS.ISSUE_BY_ID(id));
  return res.data;
};

// ─── POST create a new issue ──────────────────────────────────────────────────
export const createIssue = async (issue: IssuePayload): Promise<Issue> => {
  const res = await axiosInstance.post<Issue>(ENDPOINTS.ISSUES, issue);
  return res.data;
};

// PUT update an existing issue 
export const updateIssue = async (
  id: string,
  updatedIssue: Partial<IssuePayload>
): Promise<Issue> => {
  const res = await axiosInstance.put<Issue>(ENDPOINTS.ISSUE_BY_ID(id), updatedIssue);
  return res.data;
};

// DELETE an issue delete/:id
export const deleteIssue = async (id: string): Promise<Issue> => {
  const res = await axiosInstance.delete<Issue>(ENDPOINTS.ISSUE_BY_ID(id));
  return res.data;
};