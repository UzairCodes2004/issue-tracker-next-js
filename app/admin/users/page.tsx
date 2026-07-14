"use client";

import { useEffect, useState } from "react";
import { getAdminUsers, updateUserRole, deleteUser, AdminUser } from "../../services/adminService";

// ─── Import centralized role definitions ──────────────────────────────────
import { Role, getAllRoles, getRoleLabel } from "../../lib/auth/role";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  // ─── Confirmation Dialog State ─────
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "role" | "delete";
    userId: number;
    userName: string;
    newRole?: Role;
  } | null>(null);

  const loadUsers = () => {
    setLoading(true);
    getAdminUsers()
      .then(setUsers)
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ─── Role change handler (opens confirmation) ────────
  const handleRoleChange = (userId: number, newRole: Role, userName: string) => {
    setConfirmAction({
      type: "role",
      userId,
      userName,
      newRole,
    });
    setShowConfirm(true);
  };

  // ─── Delete handler (opens confirmation) ────────────────────────────────
  const handleDelete = (userId: number, userName: string) => {
    setConfirmAction({
      type: "delete",
      userId,
      userName,
    });
    setShowConfirm(true);
  };

  // ─── Execute the confirmed action ────────────────────────────────────────
  const executeAction = async () => {
    if (!confirmAction) return;

    setShowConfirm(false);
    const { type, userId, newRole } = confirmAction;

    if (type === "role" && newRole) {
      setUpdating(userId);
      try {
        await updateUserRole(userId, newRole);
        await loadUsers();
      } catch (err) {
        alert("Failed to update role");
      } finally {
        setUpdating(null);
      }
    } else if (type === "delete") {
      try {
        await deleteUser(userId);
        await loadUsers();
      } catch (err) {
        alert("Failed to delete user");
      }
    }

    setConfirmAction(null);
  };

  // ─── Get all roles for the dropdown ──────────────────────────────────────
  const allRoles = getAllRoles();

  if (loading) {
    return <div className="text-slate-500">Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Users</h1>
        <span className="text-sm text-slate-500">{users.length} users</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                Name
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                Email
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                Role
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                Registered
              </th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-700">{user.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(
                        user.id,
                        e.target.value as Role,
                        user.name
                      )
                    }
                    disabled={updating === user.id}
                    className="text-sm border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {allRoles.map((role) => (
                      <option key={role} value={role}>
                        {getRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{user.registered}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(user.id, user.name)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Confirmation Card (overlay) ──────────────────────────────────── */}
      {showConfirm && confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            {confirmAction.type === "role" ? (
              <>
                <h2 className="text-lg font-semibold text-slate-800 mb-2">
                  Change Role
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  Are you sure you want to change <strong>{confirmAction.userName}</strong>'s
                  role to <strong>{getRoleLabel(confirmAction.newRole!)}</strong>?
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-slate-800 mb-2">
                  Delete User
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  Are you sure you want to delete <strong>{confirmAction.userName}</strong>?
                  This action cannot be undone.
                </p>
              </>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmAction(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-150 ${
                  confirmAction.type === "delete"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {confirmAction.type === "delete" ? "Yes, Delete" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}