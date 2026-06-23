'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@radix-ui/themes';
import Link from 'next/link';
import axios from 'axios';

type Issue = {
  id: string;
  title: string;
  description: string;
  status: string;
};

const Issues = () => {
  const [list, setList] = useState<Issue[]>([]);
  const fetch = () => axios.get<Issue[]>('/api/issues').then(res => setList(res.data));
  useEffect(() => { fetch(); }, []);
  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100">
      {/* Header & Button Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Tracked Issues</h2>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm">
          <Link href="/issues/new">New Issue</Link>
        </Button>
      </div>

      <ul className="divide-y divide-slate-100">
        {list.map((i) => (
          <li
            key={i.id}
            className="flex justify-between items-center py-3.5 px-2 hover:bg-slate-50 rounded-lg transition-colors duration-150"
          >
            <Link href={`/issues/${i.id}`} className="flex flex-col gap-1 max-w-[70%] group">
              {/* Clean, prominent title */}
              <span className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors duration-150 cursor-pointer">
                {i.title}
              </span>

              {/* Muted, readable description */}
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {i.description}
              </p>
            </Link>
            {/* Dynamic Status Badge */}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${i.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                i.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-slate-100 text-slate-600'
              }`}>
              {i.status.replace('_', ' ')}
            </span>
          </li>
        ))}
      </ul>

    </div>
  );
};
export default Issues;