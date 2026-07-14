import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRole } from './useRole';
import { User } from '../lib/permissions';

export const usePermissions = () => {
  const { role } = useRole();
  const { data: session } = useSession();
  const userId = Number(session?.user?.id);

  return useMemo(() => {
    const user: User = { id: userId, role };

    return {
      user,
      role,
      userId,
      isSuperAdmin: role === 'SUPERADMIN',
      isManager: role === 'MANAGER',
      isAdmin: role === 'SUPERADMIN',
      isUser: role === 'USER',
    };
  }, [userId, role]);
};