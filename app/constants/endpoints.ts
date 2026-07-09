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
  COMMENTS_BY_ISSUE: (issueID: string) => `/comments/issue/${issueID}`,

  ADMIN: "/admin",
  ADMIN_STATS: "/admin/stats",
  ADMIN_USERS: "/admin/users",
  ADMIN_USER_BY_ID: (id: string) => `/admin/users/${id}`,
  ADMIN_USER_ROLE: (id: string) => `/admin/users/${id}/role`,
  ADMIN_ISSUES: "/admin/issues",
  ADMIN_ISSUE_BY_ID: (id: string) => `/admin/issues/${id}`,
  ADMIN_COMMENTS: "/admin/comments",
  ADMIN_COMMENT_BY_ID: (id: string) => `/admin/comments/${id}`,
};
