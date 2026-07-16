import axiosInstance from "../axios/axios";
import { ENDPOINTS } from "../constants/endpoints";

// ─── Types ──────────────────────────────────────────────────────────────────

export type Role = "USER" | "MANAGER" | "SUPERADMIN";

// All permissions – mirror of backend Permission enum
export type Permission =
  | "view:issue"
  | "create:issue"
  | "edit:own_issue"
  | "edit:any_issue"
  | "delete:own_issue"
  | "delete:any_issue"
  | "view:all_issues"
  | "create:comment"
  | "edit:own_comment"
  | "edit:any_comment"
  | "delete:own_comment"
  | "delete:any_comment"
  | "view:all_comments"
  | "view:users"
  | "edit:user_role"
  | "delete:user"
  | "view:manager_requests"
  | "review:manager_requests"
  | "access:admin_panel"
  | "access:manager_panel";

export interface UserPermissions {
  role: Role;
  permissions: Permission[];
}

// ─── State (in-memory cache) ───────────────────

let cachedPermissions: UserPermissions | null = null;
let fetchPromise: Promise<UserPermissions> | null = null;

// ─── Fetch permissions from backend ──────────────────────────────────────

export const fetchPermissions = async (): Promise<UserPermissions> => {
  // Return cache if available
  if (cachedPermissions) {
    return cachedPermissions;
  }

  // Prevent multiple concurrent requests
  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const res = await axiosInstance.get<UserPermissions>(ENDPOINTS.PERMISSIONS_ME);
      cachedPermissions = res.data;
      return cachedPermissions;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
};

// ─── Clear cache (e.g., on logout) ──────────────────────────────────────

export const clearPermissionsCache = (): void => {
  cachedPermissions = null;
  fetchPromise = null;
};

// ─── Permission check helpers ────────────────────────────────────────────

/**
 * Check if the current user has a specific permission.
 * This is the primary function used by hooks and components.
 */
export const hasPermission = async (permission: Permission): Promise<boolean> => {
  const { permissions } = await fetchPermissions();
  return permissions.includes(permission);
};

/**
 * Check if the current user has ANY of the given permissions.
 */
export const hasAnyPermission = async (permissions: Permission[]): Promise<boolean> => {
  const { permissions: userPermissions } = await fetchPermissions();
  return permissions.some((p) => userPermissions.includes(p));
};

/**
 * Check if the current user has ALL of the given permissions.
 */
export const hasAllPermissions = async (permissions: Permission[]): Promise<boolean> => {
  const { permissions: userPermissions } = await fetchPermissions();
  return permissions.every((p) => userPermissions.includes(p));
};

/**
 * Get the current user's role (without fetching permissions).
 * Use this if you only need the role, not the full permission list.
 */
export const getCurrentRole = async (): Promise<Role> => {
  const { role } = await fetchPermissions();
  return role;
};

/**
 * Get the full permissions object (role + permissions).
 */
export const getPermissions = async (): Promise<UserPermissions> => {
  return fetchPermissions();
};

/**
 * Synchronous version – returns cached permissions if available,
 * otherwise throws an error (call only after fetchPermissions has been called).
 */
export const getCachedPermissions = (): UserPermissions | null => {
  return cachedPermissions;
};