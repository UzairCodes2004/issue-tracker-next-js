import { ReactNode } from 'react';
import { useRole } from '../hooks/useRole';
import { Role } from '../lib/auth/role';

interface ProtectedContentProps {
  children: ReactNode;
  allowedRoles: Role[];
  fallback?: ReactNode;
}

export const ProtectedContent = ({
  children,
  allowedRoles,
  fallback = null,
}: ProtectedContentProps) => {
  const { role, isLoading } = useRole();

  if (isLoading) {
    return <div className="text-slate-500">Loading...</div>;
  }

  if (!allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// ─── Pre-configured versions for common use cases ──────────────────────

export const AdminOnly = ({ children, fallback }: Omit<ProtectedContentProps, 'allowedRoles'>) => (
  <ProtectedContent allowedRoles={[Role.SUPERADMIN]} fallback={fallback}>
    {children}
  </ProtectedContent>
);

export const StaffOnly = ({ children, fallback }: Omit<ProtectedContentProps, 'allowedRoles'>) => (
  <ProtectedContent allowedRoles={[Role.SUPERADMIN, Role.MANAGER]} fallback={fallback}>
    {children}
  </ProtectedContent>
);