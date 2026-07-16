import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { fetchPermissions, UserPermissions, Permission, clearPermissionsCache } from '../services/permissionService';

export const useRole = () => {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch permissions from backend
  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchPermissions()
        .then(setPermissions)
        .catch(setError)
        .finally(() => setLoading(false));
    } else if (status === 'unauthenticated') {
      setPermissions(null);
      setLoading(false);
      clearPermissionsCache();
    }
  }, [session, status]);

  // Derived booleans from permissions
  const hasPermission = (permission: Permission): boolean => {
    return permissions?.permissions?.includes(permission) ?? false;
  };

  const isSuperAdmin = hasPermission('access:admin_panel');
  const isManager = hasPermission('access:manager_panel') && !isSuperAdmin;
  const isAdmin = isSuperAdmin; // same as SUPERADMIN
  const isUser = !isSuperAdmin && !isManager;

  return {
    role: permissions?.role || null,
    permissions: permissions?.permissions || [],
    status,
    isSuperAdmin,
    isManager,
    isAdmin,
    isUser,
    isLoading: loading || status === 'loading',
    isAuthenticated: status === 'authenticated',
    hasPermission, 
  };
};