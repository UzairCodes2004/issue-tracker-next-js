"use client";

import { useState } from "react";
import { Comment, updateComment, deleteComment } from "../../../services/commentsService";

// ─── Import permission hook ──────────────────────────────────────────────
import { useCommentPermissions } from "../../../hooks/useCommentPermissions";

interface CommentItemProps {
  comment: Comment;
  onDelete: (commentId: number) => void;
  onEdit: () => void; // refresh list after edit
}

export function CommentItem({ comment, onDelete, onEdit }: CommentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Permission hook ────────────────────────────────────────────────────
  // Returns: { canEdit, canDelete }
  const { canEdit, canDelete } = useCommentPermissions(comment);

  // ─── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    setIsDeleting(true);
    try {
      await deleteComment(String(comment.id));
      onDelete(comment.id);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Edit ────────────────────────────────────────────────────────────────
  const handleEdit = () => {
    setIsEditing(true);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(comment.text);
  };

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === comment.text) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateComment(String(comment.id), { text: trimmed });
      setIsEditing(false);
      onEdit(); // refresh parent
    } catch (error) {
      console.error("Failed to update comment:", error);
      alert("Could not update comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300">
      {/* Header – username, date, actions */}
      <div className="flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
          <span className="font-medium text-slate-700">
            {comment.user?.name || "Unknown User"}
          </span>
          <span>•</span>
          <span>{new Date(comment.createdAT).toLocaleDateString()}</span>
          {comment.user?.role && (
            <>
              <span>•</span>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                {comment.user.role}
              </span>
            </>
          )}
        </div>

        {/* ─── Action buttons (conditional) ──────────────────────────────── */}
        {!isEditing && (
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={handleEdit}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content – either text or edit form */}
      {isEditing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            disabled={isSubmitting}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={isSubmitting || !editText.trim()}
              className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isSubmitting}
              className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{comment.text}</p>
      )}
    </div>
  );
}