"use client";

import { useEffect, useState } from "react";
import { getAdminStats, DashboardStats } from "../services/adminService";
import { getManagerRequestStats } from "../services/managerRequestService"; // 👈 import

// ─── Import permission hook ──────────────────────────────────────────────
import { useRole } from "../hooks/useRole";

function StatsCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
    </div>
  );
}

function StatusPill({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`}></span>
      <span className="text-sm text-slate-600">{label}:</span>
      <span className="text-sm font-semibold">{count}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingRequests, setPendingRequests] = useState(0); // 👈 new state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ─── Permission hook (for consistency, though layout already protects) ──
  const { isSuperAdmin } = useRole();

  useEffect(() => {
    // 1. Fetch main stats
    getAdminStats()
      .then(setStats)
      .catch(() => setError("Failed to load stats"))
      .finally(() => setLoading(false));

    // 2. Fetch pending manager requests count
    getManagerRequestStats()
      .then((data) => setPendingRequests(data.pending))
      .catch(() => console.error("Failed to load manager request stats"));
  }, []);

  if (loading) {
    return <div className="text-slate-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!stats) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      {/* Stats Grid – now with 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Issues"
          value={stats.totalIssues}
          color="text-indigo-600"
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          color="text-emerald-600"
        />
        <StatsCard
          title="Total Comments"
          value={stats.totalComments}
          color="text-amber-600"
        />
        <StatsCard
          title="Pending Manager Requests"
          value={pendingRequests}
          color="text-purple-600"
        />
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issues by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Issues by Status
          </h3>
          <div className="space-y-2">
            {stats.issuesByStatus.map((item) => {
              const color =
                item.status === "OPEN"
                  ? "bg-emerald-400"
                  : item.status === "IN_PROGRESS"
                  ? "bg-amber-400"
                  : "bg-slate-400";
              return (
                <StatusPill
                  key={item.status}
                  label={item.status.replace("_", " ")}
                  count={item.count}
                  color={color}
                />
              );
            })}
          </div>
        </div>

        {/* Users by Role */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Users by Role
          </h3>
          <div className="space-y-2">
            {stats.usersByRole.map((item) => {
              const color =
                item.role === "SUPERADMIN"
                  ? "bg-purple-400"
                  : item.role === "MANAGER"
                  ? "bg-blue-400"
                  : "bg-slate-400";
              return (
                <StatusPill
                  key={item.role}
                  label={item.role}
                  count={item.count}
                  color={color}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Quick Action: Pending Requests Card ────────────────────────── */}
      {pendingRequests > 0 && (
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-purple-800">
              You have {pendingRequests} pending manager request{pendingRequests > 1 ? 's' : ''}
            </span>
            <p className="text-xs text-purple-600">
              Review them in the Manager Requests section.
            </p>
          </div>
          <a
            href="/admin/manager-requests"
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Review Now
          </a>
        </div>
      )}
    </div>
  );
}