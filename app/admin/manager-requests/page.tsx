"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPendingManagerRequests,
  reviewManagerRequest,
  ManagerRequest,
  ReviewManagerRequestPayload,
} from "../../services/managerRequestService";

export default function AdminManagerRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ManagerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState<{
    requestId: number;
    action: "APPROVE" | "REJECT";
    userName: string;
  } | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingManagerRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load pending requests:", err);
      setError("Failed to load pending requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleReview = (requestId: number, action: "APPROVE" | "REJECT", userName: string) => {
    setShowConfirm({ requestId, action, userName });
  };

  const executeReview = async () => {
    if (!showConfirm) return;
    const { requestId, action } = showConfirm;
    setProcessing(requestId);
    try {
      const payload: ReviewManagerRequestPayload = { action };
      await reviewManagerRequest(requestId, payload);
      await loadRequests();
    } catch (err) {
      alert("Failed to review request.");
    } finally {
      setProcessing(null);
      setShowConfirm(null);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading requests...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manager Requests</h1>
        <span className="text-sm text-slate-500">{requests.length} pending</span>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-slate-500">No pending manager requests.</p>
          <p className="text-sm text-slate-400 mt-1">All requests have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-800">
                      {req.user?.name || "Unknown User"}
                    </span>
                    <span className="text-sm text-slate-500">({req.user?.email})</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      PENDING
                    </span>
                  </div>
                  {req.notes && (
                    <p className="text-sm text-slate-600 mt-1 border-l-2 border-yellow-300 pl-3">
                      {req.notes}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Submitted: {new Date(req.createdAt).toLocaleDateString()} at{" "}
                    {new Date(req.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleReview(req.id, "APPROVE", req.user?.name || "User")}
                    disabled={processing === req.id}
                    className="text-sm bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(req.id, "REJECT", req.user?.name || "User")}
                    disabled={processing === req.id}
                    className="text-sm bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Confirmation Modal ──────────────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              {showConfirm.action === "APPROVE" ? "Approve" : "Reject"} Request
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to <strong>{showConfirm.action.toLowerCase()}</strong> the
              manager request from <strong>{showConfirm.userName}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeReview}
                disabled={processing !== null}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  showConfirm.action === "APPROVE"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-500 hover:bg-red-600"
                } disabled:opacity-50`}
              >
                {processing === showConfirm.requestId ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}