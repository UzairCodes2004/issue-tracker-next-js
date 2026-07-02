'use client';
import React, { useState, useEffect, use } from 'react';
import { Button } from '@radix-ui/themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getIssueById,updateIssue, deleteIssue } from '@/app/services/issuesService';

type Issue = {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAT: string;
};

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    
    getIssueById(id)
      .then((data) => setIssue(data))
      .catch(() => setError('Failed to load issue.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteIssue(id);
      router.push('/issues');
    } catch (err) {
      setDeleting(false);
      setShowConfirm(false);
      setError('Failed to delete issue. Please try again.');
    }
  };

  if (loading) {
    return <p className="text-slate-500 p-6">Loading issue...</p>;
  }

  if (error && !issue) {
    return <p className="text-red-500 p-6">{error}</p>;
  }

  if (!issue) {
    return <p className="text-slate-500 p-6">Issue not found.</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100">
      {/* Back link */}
      <Link href="/issues" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← Back to Issues
      </Link>

      {/* Title & Status */}
      <div className="flex justify-between items-start mb-3">
        <h1 className="text-xl font-bold text-slate-800">{issue.title}</h1>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            issue.status === 'OPEN'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : issue.status === 'IN_PROGRESS'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {issue.status.replace('_', ' ')}
        </span>
      </div>

      {/* Description */}
      <p className="text-slate-600 leading-relaxed mb-6">{issue.description}</p>

      {/* Error banner */}
      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm">
          <Link href={`/issues/edit/${id}`}>Edit</Link>
        </Button>
        <Button
          onClick={() => setShowConfirm(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm"
        >
          Delete
        </Button>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Delete Issue?</h2>
            <p className="text-slate-500 text-sm mb-6">
              This will permanently delete &quot;{issue.title}&quot;. This action cannot be undone.
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
