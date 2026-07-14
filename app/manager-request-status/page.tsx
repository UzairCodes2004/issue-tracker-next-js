"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getMyManagerRequests, ManagerRequest } from "../services/managerRequestService";
import Link from "next/link";

export default function ManagerRequestStatusPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<ManagerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    const loadRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyManagerRequests();
        setRequests(data);
      } catch (err) {
        console.error("Failed to load manager requests:", err);
        setError("Failed to load your request status.");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [session, sessionStatus, router]);

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <p className="text-slate-500">Loading your request status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-indigo-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── No requests found ──────────────────────────────────────────────────
  if (requests.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Manager Request Status</h1>
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">No Manager Request Found</h2>
          
        </div>
      </div>
    );
  }

  // ─── Get the most recent request ──────────────────────────────────────
  const latestRequest = requests[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "PENDING":
        return "⏳";
      case "APPROVED":
        return "✅";
      case "REJECTED":
        return "❌";
      default:
        return "📋";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Your request is waiting for review by a SUPER_ADMIN. You'll receive a notification once it's reviewed.";
      case "APPROVED":
        return "Congratulations! Your request has been approved. You now have MANAGER access.";
      case "REJECTED":
        return "Your request to become manager has been rejected.";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Manager Request Status</h1>

      {/* Status Card */}
      <div className={`rounded-lg border p-6 ${latestRequest.status === "PENDING" ? "border-yellow-200 bg-yellow-50" :
          latestRequest.status === "APPROVED" ? "border-green-200 bg-green-50" :
          "border-red-200 bg-red-50"
        }`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{getStatusEmoji(latestRequest.status)}</span>
          <div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(latestRequest.status)}`}>
              {latestRequest.status}
            </span>
          </div>
        </div>

        <p className="text-slate-700 text-sm mb-4">
          {getStatusMessage(latestRequest.status)}
        </p>

        <div className="text-xs text-slate-500 space-y-1">
          <p>
            <strong>Submitted:</strong>{" "}
            {new Date(latestRequest.createdAt).toLocaleDateString()} at{" "}
            {new Date(latestRequest.createdAt).toLocaleTimeString()}
          </p>
          {latestRequest.reviewedAt && (
            <p>
              <strong>Reviewed:</strong>{" "}
              {new Date(latestRequest.reviewedAt).toLocaleDateString()} at{" "}
              {new Date(latestRequest.reviewedAt).toLocaleTimeString()}
            </p>
          )}
          {latestRequest.reviewer && (
            <p>
              <strong>Reviewed by:</strong> {latestRequest.reviewer.name}
            </p>
          )}
          {latestRequest.notes && (
            <p className="mt-2 pt-2 border-t border-slate-200">
              <strong>Your note:</strong> {latestRequest.notes}
            </p>
          )}
        </div>
      </div>

      {/* History of previous requests */}
      {requests.length > 1 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Request History</h3>
          <div className="space-y-2">
            {requests.slice(1).map((req) => (
              <div key={req.id} className="text-xs text-slate-500 border-b border-slate-100 pb-2">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(req.status)}`}>
                  {req.status}
                </span>
                <span className="ml-2">
                  {new Date(req.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}