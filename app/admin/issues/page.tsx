"use client";

import { useEffect, useState } from "react";
import { getAllIssues, deleteAdminIssue, AdminIssue } from "../../services/adminService";
import { useRouter } from "next/navigation";

export default function AdminIssuesPage() {
  const router = useRouter();
  const [issues, setIssues] = useState<AdminIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ─── Confirmation Dialog State ──────────────────────────────────────────
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  const loadIssues = () => {
    setLoading(true);
    getAllIssues()
      .then(setIssues)
      .catch(() => setError("Failed to load issues"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadIssues();
  }, []);

  // ─── Delete handler (opens confirmation) ────────────────────────────────
  const handleDelete = (id: number, title: string) => {
    setDeleteTarget({ id, title });
    setShowConfirm(true);
  };

  // ─── Execute delete ──────────────────────────────────────────────────────
  const executeDelete = async () => {
    if (!deleteTarget) return;
    setShowConfirm(false);
    try {
      await deleteAdminIssue(deleteTarget.id);
      await loadIssues();
    } catch (err) {
      alert("Failed to delete issue");
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return <div className="text-slate-500">Loading issues...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">All Issues</h1>
        <span className="text-sm text-slate-500">{issues.length} issues</span>
      </div>

      <div className="space-y-3">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:border-slate-300 transition cursor-pointer"
            onClick={() => router.push(`/admin/issues/${issue.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-800">{issue.title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      issue.status === "OPEN"
                        ? "bg-emerald-50 text-emerald-700"
                        : issue.status === "IN_PROGRESS"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    {issue.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                  {issue.description}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-slate-400">
                  <span>By: {issue.user?.name || "Unknown"}</span>
                  <span>•</span>
                  <span>{new Date(issue.createdAT).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{issue.comments?.length || 0} comments</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => router.push(`/admin/issues/${issue.id}`)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(issue.id, issue.title)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Confirmation Card (overlay) ──────────────────────────────────── */}
      {showConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Delete Issue</h2>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>?
              This action cannot be undone.
            </p>
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