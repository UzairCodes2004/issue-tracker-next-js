"use client";

import { useEffect, useState } from "react";
import { getAllComments, deleteAdminComment, AdminComment } from "../../services/adminService";

export default function ManagerCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ─── Confirmation Dialog State ──────────────────────────────────────────
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; text: string } | null>(null);

  const loadComments = () => {
    setLoading(true);
    getAllComments()
      .then(setComments)
      .catch(() => setError("Failed to load comments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComments();
  }, []);

  // ─── Delete handler (opens confirmation) ────────────────────────────────
  const handleDelete = (id: number, text: string) => {
    setDeleteTarget({ id, text });
    setShowConfirm(true);
  };

  // ─── Execute delete ──────────────────────────────────────────────────────
  const executeDelete = async () => {
    if (!deleteTarget) return;
    setShowConfirm(false);
    try {
      await deleteAdminComment(deleteTarget.id);
      await loadComments();
    } catch (err) {
      alert("Failed to delete comment");
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return <div className="text-slate-500">Loading comments...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">All Comments</h1>
        <span className="text-sm text-slate-500">{comments.length} comments</span>
      </div>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:border-slate-300 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium text-slate-700">
                    {comment.user?.name || "Unknown"}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">
                    on: {comment.issue?.title || "Unknown issue"}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400 text-xs">
                    {new Date(comment.createdAT).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{comment.text}</p>
              </div>
              <button
                onClick={() => handleDelete(comment.id, comment.text)}
                className="text-sm text-red-500 hover:text-red-700 ml-4"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Confirmation Card (overlay) ──────────────────────────────────── */}
      {showConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Delete Comment</h2>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete this comment?
            </p>
            <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm text-slate-600 border border-slate-200">
              "{deleteTarget.text.slice(0, 100)}
              {deleteTarget.text.length > 100 ? "..." : ""}"
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-150"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}