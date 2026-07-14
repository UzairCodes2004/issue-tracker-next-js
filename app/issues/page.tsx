'use client';

import React, { useState } from 'react';
import { Button } from '@radix-ui/themes';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getIssues, Issue } from '@/app/services/issuesService';

export default function IssuesPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');

  // ─── Fetch issues (backend filters based on user role) ────────────────
  const { data: list = [], isLoading, error } = useQuery<Issue[]>({
    queryKey: ['issues'],
    queryFn: getIssues,
  });

  // ─── Frontend filter by status ──────────────────────────────────────────
  const filteredList = list.filter((i) => {
    if (statusFilter === 'ALL') return true;
    return i.status === statusFilter;
  });

  if (isLoading) {
    return <p className="text-slate-500 p-6 max-w-xl mx-auto">Loading issues...</p>;
  }

  if (error) {
    return <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-50 border border-slate-100 rounded-xl max-w-xl mx-auto shadow-sm">
  <p className="text-slate-600 font-medium text-sm sm:text-base">
    Couldn't find any issues you have created. Create New Issue 
  </p>
  <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm whitespace-nowrap">
    <Link href="/issues/new">New Issue</Link>
  </Button>
</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Tracked Issues</h2>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* New Issue Button – available to all authenticated users */}
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm">
            <Link href="/issues/new">New Issue</Link>
          </Button>
        </div>
      </div>

      {/* Issue List */}
      {filteredList.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-6">
          No issues found matching this status.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {filteredList.map((issue) => (
            <li
              key={issue.id}
              className="flex justify-between items-center py-3.5 px-2 hover:bg-slate-50 rounded-lg transition-colors duration-150"
            >
              <Link
                href={`/issues/${issue.id}`}
                className="flex flex-col gap-1 max-w-[70%] group"
              >
                <span className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors duration-150 cursor-pointer">
                  {issue.title}
                </span>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {issue.description}
                </p>
              </Link>

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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}