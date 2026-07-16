import { getSession } from "next-auth/react";

// ─── Types ──────────────────────────────────────────────────────────────────
// The frontend does NOT define Permission or Role types.
// They are simply strings from the backend.

export interface UserPermissions {
  role: string;           // e.g., "USER", "MANAGER", "SUPERADMIN"
  permissions: string[];  // e.g., ["view:issue", "edit:any_issue"]
}

// ─── State (in-memory cache) ──────────────────────────────────────────────

let cachedPermissions: UserPermissions | null = null;

// ─── Fetch permissions from session ──────────────────────────────────────

export const fetchPermissions = async (): Promise<UserPermissions> => {
  if (cachedPermissions) {
    return cachedPermissions;
  }

  const session = await getSession();
  const user = session?.user;

  if (!user) {
    // Return empty permissions for unauthenticated state.
    return { role: "USER", permissions: [] };
  }

  const result: UserPermissions = {
    role: user.role || "USER",
    permissions: user.permissions || [],
  };

  cachedPermissions = result;
  return result;
};

// ─── Clear cache ──────────────────────────────────────────────────────────

export const clearPermissionsCache = (): void => {
  cachedPermissions = null;
};

// ─── Permission query helpers (no decision logic) ──────────────────────

export const hasPermission = async (permission: string): Promise<boolean> => {
  const { permissions } = await fetchPermissions();
  return permissions.includes(permission);
};

export const hasAnyPermission = async (permissions: string[]): Promise<boolean> => {
  const { permissions: userPermissions } = await fetchPermissions();
  return permissions.some((p) => userPermissions.includes(p));
};

export const hasAllPermissions = async (permissions: string[]): Promise<boolean> => {
  const { permissions: userPermissions } = await fetchPermissions();
  return permissions.every((p) => userPermissions.includes(p));
};

export const getCurrentRole = async (): Promise<string> => {
  const { role } = await fetchPermissions();
  return role;
};

export const getPermissions = async (): Promise<UserPermissions> => {
  return fetchPermissions();
};

export const getCachedPermissions = (): UserPermissions | null => {
  return cachedPermissions;
};