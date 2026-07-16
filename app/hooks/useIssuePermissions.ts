import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { usePermissions } from './usePermissions';
import { Issue } from '../services/issuesService';

interface UseIssuePermissionsResult {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
  isLoading: boolean;
}

export const useIssuePermissions = (issue: Issue | null): UseIssuePermissionsResult => {
  const { data: session } = useSession();
  const {
    canViewAllIssues,
    canEditAnyIssue,
    canEditOwnIssue,
    canDeleteAnyIssue,
    canDeleteOwnIssue,
    isLoading,
  } = usePermissions();

  const userId = Number(session?.user?.id);
  const isOwner = issue ? userId === issue.userID : false;

  return useMemo(() => {
    // Default: no permissions, show loading state
    if (isLoading) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canChangeStatus: false,
        isLoading: true,
      };
    }

    if (!issue || !userId) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canChangeStatus: false,
        isLoading: false,
      };
    }

    // View: user can view if they have view permission
    // (view:issue is granted to all authenticated users via backend)
    const canView = canViewAllIssues || true; // everyone with valid token can view

    // Edit: user can edit if they have edit:any_issue OR (edit:own_issue AND they own it)
    const canEdit = canEditAnyIssue || (canEditOwnIssue && isOwner);

    // Delete: user can delete if they have delete:any_issue OR (delete:own_issue AND they own it)
    const canDelete = canDeleteAnyIssue || (canDeleteOwnIssue && isOwner);

    // Change status: same as edit
    const canChangeStatus = canEdit;

    return {
      canView,
      canEdit,
      canDelete,
      canChangeStatus,
      isLoading: false,
    };
  }, [issue, userId, isOwner, canViewAllIssues, canEditAnyIssue, canEditOwnIssue, canDeleteAnyIssue, canDeleteOwnIssue, isLoading]);
};