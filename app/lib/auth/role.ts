

export enum Role {
  SUPERADMIN = 'SUPERADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

// ─── Single role checks ────────────────────────────────────────────────

export const isSuperAdmin = (role: Role): boolean => role === Role.SUPERADMIN;
export const isManager = (role: Role): boolean => role === Role.MANAGER;
export const isUser = (role: Role): boolean => role === Role.USER;
export const isAdmin = (role: Role): boolean => role === Role.SUPERADMIN;

// ─── Utility to convert string to Role enum ───────────────────────────

export const toRole = (raw: string | Role): Role => {
  if (!raw) return Role.USER;
  const trimmed = raw.trim().toUpperCase();
  switch (trimmed) {
    case 'SUPERADMIN':
      return Role.SUPERADMIN;
    case 'MANAGER':
      return Role.MANAGER;
    default:
      return Role.USER;
  }
};

// ─── Get all roles (for dropdowns, etc.) 

export const getAllRoles = (): Role[] => {
  return [Role.SUPERADMIN, Role.MANAGER, Role.USER];
};

export const getRoleLabel = (role: Role): string => {
  switch (role) {
    case Role.SUPERADMIN:
      return 'Super Admin';
    case Role.MANAGER:
      return 'Manager';
    case Role.USER:
      return 'User';
    default:
      return 'Unknown';
  }
};