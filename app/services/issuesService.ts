import axiosInstance from "../axios/axios";
import { ENDPOINTS } from "../constants/endpoints";

// ─── Issue Type ────────────────────────────────────────────────────────────────
// Describes the shape of data we send when creating or updating an issue.
// Pages import this type so every form knows what fields are expected.
export interface IssuePayload {
  title: string;
  description: string;
  status?: string; // optional on create (backend sets default "OPEN")
}

// ─── GET all issues ───────────────────────────────────────────────────────────
// Returns an array of every issue from the NestJS backend.
export const getIssues = async () => {
  const res = await axiosInstance.get(ENDPOINTS.ISSUES);
  return res.data;
};

// ─── GET one issue by ID ──────────────────────────────────────────────────────
// Returns a single issue object matching the given ID.
export const getIssueById = async (id: string) => {
  const res = await axiosInstance.get(ENDPOINTS.ISSUE_BY_ID(id));
  return res.data;
};

// ─── POST create a new issue ──────────────────────────────────────────────────
// Sends a new issue to the backend. Returns the created issue.
export const createIssue = async (issue: IssuePayload) => {
  const res = await axiosInstance.post(ENDPOINTS.ISSUES, issue);
  return res.data;
};

// ─── PUT update an existing issue ────────────────────────────────────────────
// Sends the updated fields to the backend. Returns the updated issue.
export const updateIssue = async (id: string, updatedIssue: IssuePayload) => {
  const res = await axiosInstance.put(ENDPOINTS.ISSUE_BY_ID(id), updatedIssue);
  return res.data;
};

// ─── DELETE an issue ─────────────────────────────────────────────────────────
// Permanently removes the issue with the given ID from the backend.
export const deleteIssue = async (id: string) => {
  const res = await axiosInstance.delete(ENDPOINTS.ISSUE_BY_ID(id));
  return res.data;
};


