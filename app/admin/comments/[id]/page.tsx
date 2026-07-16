"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@radix-ui/themes";
import { getAdminCommentById, deleteAdminComment, AdminComment } from "../../../services/adminService";
import { formatApiError } from "../../../utils/error-utils";

export default function AdminCommentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [comment, setComment] = useState<AdminComment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadComment = () => {
    setLoading(true);
    getAdminCommentById(id)
      .then(setComment)
      .catch(() => setError("Failed to load comment."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isNaN(id)) loadComment();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAdminComment(id);
      router.push("/admin/comments");
    } catch (err) {
      setError(formatApiError(err, "Failed to delete comment."));
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading comment...</div>;
  }

  if (error || !comment) {
    return <div className="text-red-500">{error || "Comment not found."}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/comments")}
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Back to comments
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Comment Details</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfirm(true)}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="mb-4">
          <p className="text-slate-700 whitespace-pre-wrap text-base leading-relaxed">
            {comment.text}
          </p>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Author:</span>
            <span className="text-slate-700">{comment.user?.name || "Unknown"}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{comment.user?.email || "No email"}</span>
            <span className="text-slate-400">•</span>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {comment.user?.role || "USER"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">On Issue:</span>
            <Link
              href={`/admin/issues/${comment.issue?.id}`}
              className="text-indigo-600 hover:underline font-medium"
            >
              {comment.issue?.title || "Unknown Issue"}
            </Link>
            <span className="text-slate-400">•</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                comment.issue?.status === "OPEN"
                  ? "bg-emerald-50 text-emerald-700"
                  : comment.issue?.status === "IN_PROGRESS"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-50 text-slate-600"
              }`}
            >
              {comment.issue?.status || "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Created:</span>
            <span className="text-slate-600">
              {new Date(comment.createdAT).toLocaleDateString()} at{" "}
              {new Date(comment.createdAT).toLocaleTimeString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Last Updated:</span>
            <span className="text-slate-600">
              {new Date(comment.updatedAT).toLocaleDateString()} at{" "}
              {new Date(comment.updatedAT).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          asChild
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg"
        >
          <Link href={`/admin/issues/${comment.issue?.id}`}>View Related Issue</Link>
        </Button>
        <Button
          onClick={() => setShowConfirm(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg"
        >
          Delete Comment
        </Button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Delete Comment?</h2>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete this comment?
            </p>
            <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm text-slate-600 border border-slate-200">
              "{comment.text.slice(0, 150)}
              {comment.text.length > 150 ? "..." : ""}"
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}