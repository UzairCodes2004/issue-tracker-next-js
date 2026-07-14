import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRole } from './useRole';
import { canEditComment, canDeleteComment, Comment } from '../lib/permissions';

interface UseCommentPermissionsResult {
  canEdit: boolean;
  canDelete: boolean;
}

export const useCommentPermissions = (comment: Comment | null): UseCommentPermissionsResult => {
  const { role } = useRole();
  const { data: session } = useSession();
  const userId = Number(session?.user?.id);

  return useMemo(() => {
    const defaultResult: UseCommentPermissionsResult = {
      canEdit: false,
      canDelete: false,
    };

    if (!comment || !userId) {
      return defaultResult;
    }

    const user = { id: userId, role };

    return {
      canEdit: canEditComment(user, comment),
      canDelete: canDeleteComment(user, comment),
    };
  }, [comment, userId, role]);
};