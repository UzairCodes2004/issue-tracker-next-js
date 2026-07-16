import { useMemo } from 'react';
import { useRole } from './useRole';

export const usePermissions = () => {
  const { role, permissions, hasPermission, isLoading, isAuthenticated } = useRole();

  return useMemo(() => {
    return {
      role,
      permissions,
      hasPermission,
      isLoading,
      isAuthenticated,

      // ─── Issue permissions ──────────────────────────────────────────────
      canViewIssues: hasPermission('view:issue'),
      canCreateIssues: hasPermission('create:issue'),
      canEditAnyIssue: hasPermission('edit:any_issue'),
      canEditOwnIssue: hasPermission('edit:own_issue'),
      canDeleteAnyIssue: hasPermission('delete:any_issue'),
      canDeleteOwnIssue: hasPermission('delete:own_issue'),
      canViewAllIssues: hasPermission('view:all_issues'),

      // ─── Comment permissions ────────────────────────────────────────────
      canCreateComments: hasPermission('create:comment'),
      canEditAnyComment: hasPermission('edit:any_comment'),
      canEditOwnComment: hasPermission('edit:own_comment'),
      canDeleteAnyComment: hasPermission('delete:any_comment'),
      canDeleteOwnComment: hasPermission('delete:own_comment'),
      canViewAllComments: hasPermission('view:all_comments'),

      // ─── User management ────────────────────────────────────────────────
      canViewUsers: hasPermission('view:users'),
      canEditUserRole: hasPermission('edit:user_role'),
      canDeleteUser: hasPermission('delete:user'),

      // ─── Manager requests ───────────────────────────────────────────────
      canViewManagerRequests: hasPermission('view:manager_requests'),
      canReviewManagerRequests: hasPermission('review:manager_requests'),

      // ─── Panel access ──────────────────────────────────────────────────
      canAccessAdminPanel: hasPermission('access:admin_panel'),
      canAccessManagerPanel: hasPermission('access:manager_panel'),
    };
  }, [role, permissions, hasPermission, isLoading, isAuthenticated]);
};