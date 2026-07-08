'use client';
import { TextField, TextArea, Button } from '@radix-ui/themes';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { createIssue } from '@/app/services/issuesService';

interface IssueForm {
  title: string;
  description: string;
}

const NewIssuePage = () => {
  const router = useRouter();
  const {register,handleSubmit,formState: { errors, isSubmitting }} = useForm<IssueForm>({
    mode: 'onSubmit', 
  });

  const onSubmit = async (data: IssueForm) => {
    try {
      await createIssue(data);
      router.push('/issues');
    } catch (error) {
      console.error('Failed to submit issue:', error);
      // Optionally set a global error state here
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
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
  );
};

export default NewIssuePage;