// ─── Base URL ───────────────────────────────────────────────────────────────
// This is the address of our NestJS backend server.
// Change it here and every service in the app will automatically use the new address.
export const BASE_URL = "http://localhost:5000";

// ─── Endpoints ───────────────────────────────────────────────────────────────
// All API paths live here. Pages and services import from this file instead
// of writing raw strings like "/issues" or "/users/5" scattered everywhere.
export const ENDPOINTS = {
  // Issue routes
  ISSUES: "/issues",
  ISSUE_BY_ID: (id: string) => `/issues/${id}`,

  // User routes
  USERS: "/users",
  USER_BY_ID: (id: string) => `/users/${id}`,
  AUTH: "/auth",

  COMMENTS: "/comments",
  COMMENT_BY_ID: (id: string) => `/comments/${id}`,
  COMMENTS_BY_ISSUE: (issueID: string) => `/comments/issue/${issueID}`
};
