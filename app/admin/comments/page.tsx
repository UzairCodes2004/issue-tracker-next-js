"use client";

import { useEffect, useState } from "react";
import { getAllComments, deleteAdminComment, AdminComment } from "../../services/adminService";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleDelete = async (id: number, text: string) => {
    if (!confirm(`Delete comment: "${text.slice(0, 50)}..."?`)) return;
    try {
      await deleteAdminComment(id);
      await loadComments();
    } catch (err) {
      alert("Failed to delete comment");
    }
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
    </div>
  );
}