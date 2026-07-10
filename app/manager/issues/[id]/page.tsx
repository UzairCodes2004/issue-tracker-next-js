"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAdminIssueById, updateAdminIssue, deleteAdminIssue, AdminIssue } from "../../../services/adminService";
import { IssueStatus } from "../../../services/issuesService";

export default function ManagerIssueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [issue, setIssue] = useState<AdminIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Confirmation Dialog State ──────────────────────────────────────────
  const [showConfirm, setShowConfirm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<IssueStatus>("OPEN");

  const loadIssue = () => {
    setLoading(true);
    getAdminIssueById(id)
      .then((data) => {
        setIssue(data);
        setTitle(data.title);
        setDescription(data.description);
        setStatus(data.status as IssueStatus);
      })
      .catch(() => setError("Failed to load issue"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isNaN(id)) loadIssue();
  }, [id]);

  // ─── Update handler ──────────────────────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateAdminIssue(id, { title, description, status });
      setIsEditing(false);
      await loadIssue();
    } catch (err) {
      alert("Failed to update issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Delete handler (opens confirmation) ────────────────────────────────
  const handleDelete = () => {
    setShowConfirm(true);
  };

  // ─── Execute delete ──────────────────────────────────────────────────────
  const executeDelete = async () => {
    setShowConfirm(false);
    try {
      await deleteAdminIssue(id);
      router.push("/manager/issues");
    } catch (err) {
      alert("Failed to delete issue");
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading issue...</div>;
  }

  if (error || !issue) {
    return <div className="text-red-500">{error || "Issue not found"}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/manager/issues")}
          className="text-sm text-amber-600 hover:underline"
        >
          ← Back to issues
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Issue Details</h1>
      </div>

      {/* Issue Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{issue.title}</h2>
            <div className="flex gap-4 mt-2 text-xs text-slate-500">
              <span>Created: {new Date(issue.createdAT).toLocaleDateString()}</span>
              <span>•</span>
              <span>By: {issue.user?.name || "Unknown"}</span>
              <span>•</span>
              <span>Status: </span>
              <span
                className={`font-medium ${
                  issue.status === "OPEN"
                    ? "text-emerald-600"
                    : issue.status === "IN_PROGRESS"
                    ? "text-amber-600"
                    : "text-slate-600"
                }`}
              >
                {issue.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-sm text-amber-600 hover:text-amber-800"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={handleDelete}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
        <p className="text-slate-600 whitespace-pre-wrap">{issue.description}</p>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Edit Issue</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comments */}
      {issue.comments && issue.comments.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Comments ({issue.comments.length})</h3>
          <div className="space-y-3">
            {issue.comments.map((comment) => (
              <div key={comment.id} className="border-b border-slate-100 pb-3 last:border-0">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{comment.user?.name || "Unknown"}</span>
                  <span>•</span>
                  <span>{new Date(comment.createdAT).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Card ────────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Delete Issue</h2>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete <strong>"{issue.title}"</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
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