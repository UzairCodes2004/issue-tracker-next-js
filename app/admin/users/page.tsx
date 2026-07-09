"use client";

import { useEffect, useState } from "react";
import { getAdminUsers, updateUserRole, deleteUser, AdminUser } from "../../services/adminService";

type UserRole = "USER" | "MANAGER" | "SUPERADMIN";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

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

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    if (!confirm(`Change role to ${newRole}?`)) return;
    setUpdating(userId);
    try {
      await updateUserRole(userId, newRole);
      await loadUsers();
    } catch (err) {
      alert("Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (userId: number, userName: string) => {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    try {
      await deleteUser(userId);
      await loadUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

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
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    disabled={updating === user.id}
                    className="text-sm border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="USER">User</option>
                    <option value="MANAGER">Manager</option>
                    <option value="SUPERADMIN">Super Admin</option>
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
    </div>
  );
}