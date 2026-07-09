"use client";

import { useState } from "react";
import { createComment, CreateComment } from "../../../services/commentsService";

interface CommentFormProps {
  issueId: number;
  onCommentPosted?: () => void;
}

export function CommentForm({ issueId, onCommentPosted }: CommentFormProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) {
      setError("Comment cannot be empty.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const payload: CreateComment = {
        text: trimmed,
        issueID: issueId, 
      };

      await createComment(payload);

      setText("");
      onCommentPosted?.();
    } catch (err) {
      console.error("Failed to post comment:", err);
      setError("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      <label htmlFor="comment" className="text-sm font-medium text-slate-700">
        Add a comment
      </label>

      <textarea
        id="comment"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your comment here..."
        className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        rows={3}
        disabled={isSubmitting}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || !text.trim()}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSubmitting ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}