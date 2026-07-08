'use client';
import React, { useState, useEffect, use } from 'react';
import { TextField, TextArea, Button } from '@radix-ui/themes';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getIssueById, updateIssue, IssueStatus } from '@/app/services/issuesService';

interface IssueForm {
  title: string;
  description: string;
  status: IssueStatus;
}

export default function EditIssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IssueForm>({
    mode: 'onSubmit'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getIssueById(id)
      .then((data) => {
        reset({
          title: data.title,
          description: data.description,
          status: data.status,
        });
      })
      .catch(() => setError('Failed to load issue data.'))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data: IssueForm) => {
    try {
      setError('');
      await updateIssue(id, data);
      router.push('/issues');
    } catch (err) {
      setError('Failed to update issue. Please try again.');
    }
  };

  if (loading) {
    return <p className="text-slate-500 p-6">Loading issue...</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100">
      <Link href={`/issues/${id}`} className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← Back to Issue
      </Link>

      <h1 className="text-xl font-bold text-slate-800 mb-6">Edit Issue</h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <TextField.Root
            placeholder="Title"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <TextArea
            placeholder="Description"
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <select
            {...register('status')}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button asChild variant="soft">
            <Link href={`/issues/${id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}