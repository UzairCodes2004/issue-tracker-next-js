"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAdminIssueById, updateAdminIssue, deleteAdminIssue, AdminIssue } from "../../../services/adminService";
import { IssueStatus } from "../../../services/issuesService";

// ─── Import comment components ──────────────────
import { CommentList } from "../../../issues/[id]/comments/CommentList";
import { CommentForm } from "../../../issues/[id]/comments/CommentForm";

export default function AdminIssueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [issue, setIssue] = useState<AdminIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Comments state ─────────────────────────────────────────────────────
  const [refreshComments, setRefreshComments] = useState(0);
  const [showComments, setShowComments] = useState(false);

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

  const handleDelete = async () => {
    if (!confirm(`Delete issue "${issue?.title}"?`)) return;
    try {
      await deleteAdminIssue(id);
      router.push("/admin/issues");
    } catch (err) {
      alert("Failed to delete issue");
    }
  };

  const handleCommentPosted = () => {
    setRefreshComments((prev) => prev + 1);
  };

  if (loading) {
    return <div className="text-slate-500">Loading issue...</div>;
  }

  if (error || !issue) {
    return <div className="text-red-500">{error || "Issue not found"}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/admin/issues")}
          className="text-sm text-indigo-600 hover:underline"
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
              className="text-sm text-indigo-600 hover:text-indigo-800"
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

      {/* Edit Form (conditionally shown) */}
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
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

      {/* ─── Comments Section ────────────────────────────────────────────── */}
      <div className="mt-10 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Comments</h3>
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {showComments ? "Hide Comments" : "Show Comments"}
          </button>
        </div>

        {showComments && (
          <div>
            <CommentList issueId={id} refreshTrigger={refreshComments} />
            <CommentForm issueId={id} onCommentPosted={handleCommentPosted} />
          </div>
        )}
      </div>
    </div>
  );
}