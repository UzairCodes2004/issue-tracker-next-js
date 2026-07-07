'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getIssues, Issue } from '../services/issuesService';


export default function Dashboard() {
 
  const { data: issues = [], isLoading, error } = useQuery<Issue[]>({
    queryKey: ['issues'],
    queryFn: getIssues,
  });

  if (isLoading) return <p className="text-slate-500 p-6 max-w-xl mx-auto">Loading dashboard...</p>;
  if (error) return <p className="text-red-500 p-6 max-w-xl mx-auto">Failed to load dashboard statistics.</p>;

  // Calculate counts
  const issuesArray = Array.isArray(issues) ? issues : [];
  const total = issuesArray.length;
  const open = issuesArray.filter(i => i.status === 'OPEN').length;
  const inProgress = issuesArray.filter(i => i.status === 'IN_PROGRESS').length;
  const closed = issuesArray.filter(i => i.status === 'CLOSED').length;

  
  const maxVal = Math.max(total, open, inProgress, closed, 1);

  
  const cards = [
    { label: 'Total Issues', count: total, bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700' },
    { label: 'Open Issues', count: open, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
    { label: 'In Progress', count: inProgress, bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700' },
    { label: 'Closed Issues', count: closed, bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-700' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Summary of current system issues and their progress.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {cards.map((card, idx) => (
          <div key={idx} className={`p-4 rounded-xl border ${card.bg} ${card.border} transition-transform duration-200 hover:-translate-y-0.5 shadow-sm`}>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">{card.label}</span>
            <span className={`text-3xl font-extrabold ${card.text} mt-2 block`}>{card.count}</span>
          </div>
        ))}
      </div>

      {/* Bar Chart Section */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Issues Overview</h2>
        
        {total === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm">No issues registered yet.</p>
            <Link href="/issues/new" className="text-sm text-indigo-600 hover:underline mt-2 inline-block font-medium">
              Create your first issue
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Chart Graphic container */}
            <div className="flex justify-around items-end w-full max-w-lg h-64 border-b border-slate-200 pb-2 px-4 gap-6">
              
              {/* Bar: Total */}
              <div className="flex flex-col items-center w-full group">
                <div className="w-16 bg-linear-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-500 ease-out hover:opacity-90 shadow-sm flex items-end justify-center"
                     style={{ height: `${(total / maxVal) * 220}px` }}>
                  <span className="text-white text-xs font-bold mb-2 group-hover:scale-110 transition-transform">{total}</span>
                </div>
              </div>

              {/* Bar: Open */}
              <div className="flex flex-col items-center w-full group">
                <div className="w-16 bg-linear-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-500 ease-out hover:opacity-90 shadow-sm flex items-end justify-center"
                     style={{ height: `${(open / maxVal) * 220}px` }}>
                  <span className="text-white text-xs font-bold mb-2 group-hover:scale-110 transition-transform">{open}</span>
                </div>
              </div>

              {/* Bar: In Progress */}
              <div className="flex flex-col items-center w-full group">
                <div className="w-16 bg-linear-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-500 ease-out hover:opacity-90 shadow-sm flex items-end justify-center"
                     style={{ height: `${(inProgress / maxVal) * 220}px` }}>
                  <span className="text-white text-xs font-bold mb-2 group-hover:scale-110 transition-transform">{inProgress}</span>
                </div>
              </div>

              {/* Bar: Closed */}
              <div className="flex flex-col items-center w-full group">
                <div className="w-16 bg-linear-to-t from-slate-500 to-slate-400 rounded-t-lg transition-all duration-500 ease-out hover:opacity-90 shadow-sm flex items-end justify-center"
                     style={{ height: `${(closed / maxVal) * 220}px` }}>
                  <span className="text-white text-xs font-bold mb-2 group-hover:scale-110 transition-transform">{closed}</span>
                </div>
              </div>

            </div>

            
            <div className="flex justify-around w-full max-w-lg mt-3 text-center px-4 gap-6">
              <span className="text-xs font-semibold text-indigo-700 flex-1">Total</span>
              <span className="text-xs font-semibold text-emerald-700 flex-1">Open</span>
              <span className="text-xs font-semibold text-amber-700 flex-1">In Progress</span>
              <span className="text-xs font-semibold text-slate-600 flex-1">Closed</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Link href="/issues" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
          Manage Detailed Issues list →
        </Link>
      </div>
    </div>
  );
}
