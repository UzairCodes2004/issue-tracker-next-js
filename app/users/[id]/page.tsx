'use client';
import React, { useState, useEffect, use } from 'react';
import { Button } from '@radix-ui/themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { getUserById, deleteUser } from '../../services/usersService';
import { createManagerRequest } from '../../services/managerRequestService';
import { useSession } from 'next-auth/react';
import { usePermissions } from '../../hooks/usePermissions'; // 👈 Use permissions hook
import { formatApiError } from '../../utils/error-utils';

type UserProfile = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { canAccessManagerPanel } = usePermissions(); // 👈 Get permission

  const [user, setUser] = useState<UserProfile>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ─── Manager Request State ──────────────────────────────────────────────
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [managerReason, setManagerReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managerError, setManagerError] = useState<string | null>(null);
  const [managerSuccess, setManagerSuccess] = useState<string | null>(null);

  const isOwnProfile = session?.user?.id === id;
  const isGoogleUser = session?.user?.registered === 'GOOGLE_OAUTH';

  // Load user profile
  useEffect(() => {
    getUserById(id)
      .then((data) => setUser(data))
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteUser(id);
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      setDeleting(false);
      setShowConfirm(false);
      setError('Failed to delete account. Please try again.');
    }
  };

  // ─── Apply for Manager ──────────────────────────────────────────────────
  const handleApplyManager = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!managerReason.trim()) {
      setManagerError('Please provide a reason for your request.');
      return;
    }

    setIsSubmitting(true);
    setManagerError(null);
    setManagerSuccess(null);

    try {
      await createManagerRequest({
        reason: managerReason.trim(),
      });
      setManagerSuccess('Manager request submitted successfully! It is now pending approval.');
      setManagerReason('');
      setShowManagerForm(false);
    } catch (err) {
      setManagerError(formatApiError(err, 'Failed to submit manager request.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-slate-500 p-6">Loading profile...</p>;
  }

  if (error && !user) {
    return <p className="text-red-500 p-6">{error}</p>;
  }

  if (!user) {
    return <p className="text-slate-500 p-6">User not found.</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100">
      <h1 className="text-xl font-bold text-slate-800 mb-6">My Profile</h1>

      {/* User Info */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 w-16">Name</span>
          <span className="text-sm font-medium text-slate-800">{user.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 w-16">Email</span>
          <span className="text-sm text-slate-600">{user.email}</span>
        </div>
        {user.role && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 w-16">Role</span>
            <span className="text-sm font-medium text-indigo-600">{user.role}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 w-16">Registered</span>
          <span className="text-sm text-slate-600">
            {isGoogleUser ? 'Google OAuth' : 'Credentials'}
          </span>
        </div>
      </div>

      {/* ─── Apply for Manager (Only Google users, own profile, not already manager) ─── */}
      {/* ✅ Uses permission from backend instead of role check */}
      {isOwnProfile && isGoogleUser && !canAccessManagerPanel && (
        <div className="border-t border-slate-200 pt-4 mb-6">
          {!showManagerForm ? (
            <button
              onClick={() => setShowManagerForm(true)}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Apply to be Manager
            </button>
          ) : (
            <form onSubmit={handleApplyManager} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Why do you want to become a manager? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={managerReason}
                  onChange={(e) => setManagerReason(e.target.value)}
                  placeholder="Describe your experience and reasons..."
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {managerError && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{managerError}</p>
              )}
              {managerSuccess && (
                <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{managerSuccess}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowManagerForm(false);
                    setManagerReason('');
                    setManagerError(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          asChild
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm"
        >
          <Link href={`/users/edit/${id}`}>Edit Profile</Link>
        </Button>
        <Button
          onClick={() => setShowConfirm(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm"
        >
          Delete Account
        </Button>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Delete Account?</h2>
            <p className="text-slate-500 text-sm mb-6">
              This will permanently delete your account. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-150 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}