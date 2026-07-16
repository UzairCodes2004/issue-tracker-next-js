'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { TextField, TextArea, Button } from '@radix-ui/themes';
import { createIssue } from '@/app/services/issuesService';

interface IssueForm {
  title: string;
  description: string;
}

const NewIssuePage = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IssueForm>({
    mode: 'onSubmit',
    defaultValues: { title: '', description: '' },
  });

  const onSubmit = async (data: IssueForm) => {
    setSubmitError(null);
    try {
      await createIssue(data);
      router.push('/issues');
    } catch (error) {
      console.error('Failed to submit issue:', error);
      setSubmitError('Failed to create issue. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Create New Issue</h1>

      {submitError && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          {submitError}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            className="my-5"
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit New Issue'}
        </Button>
      </form>
    </div>
  );
};

export default NewIssuePage;