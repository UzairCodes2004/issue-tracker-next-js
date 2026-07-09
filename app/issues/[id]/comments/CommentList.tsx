"use client";

import { useEffect, useState } from "react";
import { getCommentsForIssue, Comment } from "../../../services/commentsService";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  issueId: number;
  refreshTrigger: number; // increment to force reload
}

export function CommentList({ issueId, refreshTrigger }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCommentsForIssue(String(issueId));
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments:", err);
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  // Load comments on mount and when refreshTrigger changes
  useEffect(() => {
    loadComments();
  }, [issueId, refreshTrigger]);

  const handleDelete = async (commentId: number) => {
    // The delete is already done in CommentItem; we just need to refresh.
    await loadComments(); // reload after deletion
  };

  const handleEdit = async () => {
    await loadComments(); // reload after edit
  };

  if (loading) {
    return (
      <div className="py-6 text-center text-sm text-slate-500">
        Loading comments...
      </div>
    );
  }

  if (error) {
    return <div className="py-6 text-center text-sm text-red-500">{error}</div>;
  }

  if (comments.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-500">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
}