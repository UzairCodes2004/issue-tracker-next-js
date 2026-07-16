import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { usePermissions } from './usePermissions';
import { Comment } from '../services/commentsService';

interface UseCommentPermissionsResult {
  canEdit: boolean;
  canDelete: boolean;
  isLoading: boolean;
}

export const useCommentPermissions = (comment: Comment | null): UseCommentPermissionsResult => {
  const { data: session } = useSession();
  const {
    canEditAnyComment,
    canEditOwnComment,
    canDeleteAnyComment,
    canDeleteOwnComment,
    isLoading,
  } = usePermissions();

  const userId = Number(session?.user?.id);
  const isOwner = comment ? userId === comment.userID : false;

  return useMemo(() => {
    // Default: no permissions, show loading state
    if (isLoading) {
      return {
        canEdit: false,
        canDelete: false,
        isLoading: true,
      };
    }

    if (!comment || !userId) {
      return {
        canEdit: false,
        canDelete: false,
        isLoading: false,
      };
    }

    // Edit: user can edit if they have edit:any_comment OR (edit:own_comment AND they own it)
    const canEdit = canEditAnyComment || (canEditOwnComment && isOwner);

    // Delete: user can delete if they have delete:any_comment OR (delete:own_comment AND they own it)
    const canDelete = canDeleteAnyComment || (canDeleteOwnComment && isOwner);

    return {
      canEdit,
      canDelete,
      isLoading: false,
    };
  }, [comment, userId, isOwner, canEditAnyComment, canEditOwnComment, canDeleteAnyComment, canDeleteOwnComment, isLoading]);
};