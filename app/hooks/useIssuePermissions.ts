import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRole } from './useRole';
import { canViewIssue, canEditIssue, canDeleteIssue, canChangeIssueStatus, Issue } from '../lib/permissions';

interface UseIssuePermissionsResult {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
}

// Accept `Issue | null` to handle loading state
export const useIssuePermissions = (issue: Issue | null): UseIssuePermissionsResult => {
  const { role } = useRole();
  const { data: session } = useSession();
  const userId = Number(session?.user?.id);

  return useMemo(() => {
    const defaultResult: UseIssuePermissionsResult = {
      canView: false,
      canEdit: false,
      canDelete: false,
      canChangeStatus: false,
    };

    if (!issue || !userId) {
      return defaultResult;
    }

    const user = { id: userId, role };

    return {
      canView: canViewIssue(user, issue),
      canEdit: canEditIssue(user, issue),
      canDelete: canDeleteIssue(user, issue),
      canChangeStatus: canChangeIssueStatus(user, issue),
    };
  }, [issue, userId, role]);
};