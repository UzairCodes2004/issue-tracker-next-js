'use client';
import React, { useState } from 'react';
import { Button } from '@radix-ui/themes';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getIssues, Issue } from '@/app/services/issuesService';


const Issues = () => {
  const [statusFilter, setStatusFilter] = useState('ALL');


  const { data: list = [], isLoading, error } = useQuery<Issue[]>({
    queryKey: ['issues'],
    queryFn: getIssues,
  });

  
  const filteredList = list.filter(i => {
    if (statusFilter === 'ALL') return true;
    return i.status === statusFilter;
  });

  if (isLoading) return <p className="text-slate-500 p-6 max-w-xl mx-auto">Loading issues...</p>;
  if (error) return <p className="text-red-500 p-6 max-w-xl mx-auto">Failed to load issues.</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100">
      
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Tracked Issues</h2>
        <div className="flex items-center gap-3">
          
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

          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm">
            <Link href="/issues/new">New Issue</Link>
          </Button>
        </div>
      </div>

      {filteredList.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-6">No issues found matching this status.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {filteredList.map((i) => (
            <li
              key={i.id}
              className="flex justify-between items-center py-3.5 px-2 hover:bg-slate-50 rounded-lg transition-colors duration-150"
            >
              <Link href={`/issues/${i.id}`} className="flex flex-col gap-1 max-w-[70%] group">
                <span className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors duration-150 cursor-pointer">
                  {i.title}
                </span>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {i.description}
                </p>
              </Link>
              
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${i.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  i.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-slate-100 text-slate-600'
                }`}>
                {i.status.replace('_', ' ')}
              </span>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
};
export default Issues;
