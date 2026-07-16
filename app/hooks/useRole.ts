import { useSession } from 'next-auth/react';

export const useRole = () => {
  const { data: session, status } = useSession();
  const user = session?.user;

  const role = user?.role || 'USER';
  const permissions = user?.permissions || [];

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const isSuperAdmin = hasPermission('access:admin_panel');
  const isManager = hasPermission('access:manager_panel') && !isSuperAdmin;
  const isAdmin = isSuperAdmin;
  const isUser = !isSuperAdmin && !isManager;

  return {
    role,
    permissions,
    status,
    isSuperAdmin,
    isManager,
    isAdmin,
    isUser,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    hasPermission,
  };
};