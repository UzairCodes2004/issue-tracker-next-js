'use client';
import React, { useState, useEffect, use } from 'react';
import { Button } from '@radix-ui/themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import axios from 'axios';

type UserProfile = {
  id: number;
  name: string;
  email: string;
};

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    axios
      .get<UserProfile>(`/api/user/${id}`)
      .then((res) => setUser(res.data))
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`/api/user/${id}`);
      // Sign out and redirect to home after account deletion
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      setDeleting(false);
      setShowConfirm(false);
      setError('Failed to delete account. Please try again.');
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

      {/* Profile details */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 w-16">Name</span>
          <span className="text-sm font-medium text-slate-800">{user.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 w-16">Email</span>
          <span className="text-sm text-slate-600">{user.email}</span>
        </div>
      </div>

      {/* Error banner */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Action buttons */}
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
