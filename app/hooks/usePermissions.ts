import { useMemo } from 'react';
import { useSession } from 'next-auth/react';

export const usePermissions = () => {
  const { data: session, status } = useSession();
  const user = session?.user;

  const permissions = user?.permissions || [];
  const role = user?.role || 'USER';

  // Helper to check a specific permission (string)
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  return useMemo(() => {
    return {
      role,
      permissions,
      hasPermission,
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated',

      // ─── Pre‑computed booleans (still using strings) ───────────────────
      canViewIssues: hasPermission('view:issue'),
      canCreateIssues: hasPermission('create:issue'),
      canEditAnyIssue: hasPermission('edit:any_issue'),
      canEditOwnIssue: hasPermission('edit:own_issue'),
      canDeleteAnyIssue: hasPermission('delete:any_issue'),
      canDeleteOwnIssue: hasPermission('delete:own_issue'),
      canViewAllIssues: hasPermission('view:all_issues'),

      canCreateComments: hasPermission('create:comment'),
      canEditAnyComment: hasPermission('edit:any_comment'),
      canEditOwnComment: hasPermission('edit:own_comment'),
      canDeleteAnyComment: hasPermission('delete:any_comment'),
      canDeleteOwnComment: hasPermission('delete:own_comment'),
      canViewAllComments: hasPermission('view:all_comments'),

      canViewUsers: hasPermission('view:users'),
      canEditUserRole: hasPermission('edit:user_role'),
      canDeleteUser: hasPermission('delete:user'),

      canViewManagerRequests: hasPermission('view:manager_requests'),
      canReviewManagerRequests: hasPermission('review:manager_requests'),

      canAccessAdminPanel: hasPermission('access:admin_panel'),
      canAccessManagerPanel: hasPermission('access:manager_panel'),
    };
  }, [permissions, role, status]);
};