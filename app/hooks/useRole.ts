import { useSession } from 'next-auth/react';
import { Role, toRole, isSuperAdmin, isManager, isAdmin, isUser } from '../lib/auth/role';

export const useRole = () => {
  const { data: session, status } = useSession();
  const rawRole = session?.user?.role;
  const role = toRole(rawRole ?? '');

  return {
    role,
    status,
    isSuperAdmin: isSuperAdmin(role),
    isManager: isManager(role),
    isAdmin: isAdmin(role),
    isUser: isUser(role),
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
};