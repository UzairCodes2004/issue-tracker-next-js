'use client';
import React, { useState, useEffect, use } from 'react';
import { Button } from '@radix-ui/themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; 
import { getIssueById, updateIssue, deleteIssue, Issue } from '@/app/services/issuesService';
import { CommentList } from './comments/CommentList';
import { CommentForm } from './comments/CommentForm';

type SessionUser = {
  id: string;
  role: string;
  accessToken: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession(); 

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ─── Comments state ─────────────────────────────────────────────
  const [refreshComments, setRefreshComments] = useState(0);
  const [showComments, setShowComments] = useState(false);

  // ─── Get user info from session ────────────────────────────────
  const currentUserId = (session?.user as SessionUser)?.id;
  const userRole = (session?.user as SessionUser)?.role;
  const isManager = userRole === 'MANAGER';
  const isAdmin = userRole==='SUPERADMIN'

  useEffect(() => {
    getIssueById(id)
      .then((data) => setIssue(data))
      .catch(() => setError('You can only see the Details & Edit those Issues which you have created yourself.'))
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

  const handleCommentPosted = () => {
    setRefreshComments((prev) => prev + 1);
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

  // ───  Check if user can view his own issue ────────────────────────────
  const isOwner = Number(currentUserId) === issue.userID;

  // If not manager/admin and not owner → show restricted message
  if (!isManager && !isAdmin && !isOwner) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100">
        <Link href="/issues" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
          ← Back to Issues
        </Link>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-slate-500 text-center max-w-sm">
            You can only view the details of issues you have created.
          </p>
          <Link
            href="/issues"
            className="mt-4 text-sm text-indigo-600 hover:underline"
          >
            Go back to your issues
          </Link>
        </div>
      </div>
    );
  }

  // ─── Calculate permissions for edit/delete buttons ──────────────────────
  const canEdit = isOwner || isManager|| isAdmin;
  const canDelete = isOwner || isManager||isAdmin;

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

      {/* ====== Creator & Last Editor Info Panel ====== */}
      <div className="mt-4 mb-6 text-xs text-slate-400 border-t border-slate-200/60 pt-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>Created by</span>
          <span className="font-medium text-slate-600">{issue.user?.name}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">Role:</span>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
            {issue.user?.role}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">Email:</span>
          <span className="text-slate-600">{issue.user?.email}</span>
        </div>
        {issue.updatedByUser && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 pt-2 border-t border-slate-200/60">
            <span>Last edited by</span>
            <span className="font-medium text-slate-600">{issue.updatedByUser.name}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Role:</span>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {issue.updatedByUser.role}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Email:</span>
            <span className="text-slate-600">{issue.updatedByUser.email}</span>
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* ─── Action buttons (conditional) ────────────────────────────────── */}
      <div className="flex gap-3">
        {canEdit && (
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm">
            <Link href={`/issues/edit/${id}`}>Edit</Link>
          </Button>
        )}
        {canDelete && (
          <Button
            onClick={() => setShowConfirm(true)}
            className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm"
          >
            Delete
          </Button>
        )}
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

      {/* ==================== Comments Section with Toggle ==================== */}
      <div className="mt-10 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Comments</h2>
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {showComments ? 'Hide Comments' : 'Show Comments'}
          </button>
        </div>

        {showComments && (
          <div>
            <CommentList issueId={Number(id)} refreshTrigger={refreshComments} />
            <CommentForm issueId={Number(id)} onCommentPosted={handleCommentPosted} />
          </div>
        )}
      </div>
    </div>
  );
}