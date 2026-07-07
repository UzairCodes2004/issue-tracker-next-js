'use client'
import { TextField, TextArea, Button } from '@radix-ui/themes'
import React, { useState } from 'react'
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import { createIssue } from '@/app/services/issuesService';
import { useQueryClient } from '@tanstack/react-query';

interface IssueForm {
  title: string;
  description: string;
}

const NewIssuePage = () => {
  const router = useRouter()
  const { register, handleSubmit } = useForm<IssueForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const onSubmit = async (data: IssueForm) => {
    try {
      setIsSubmitting(true);
      setError('');
      await createIssue(data);
      // Invalidate the issues cache so the list and dashboard refresh
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      router.push('/issues');
    } catch (error: any) {
      setIsSubmitting(false);
      setError(error?.response?.data?.message || 'Failed to submit issue. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-100 p-3 rounded-lg">
          {error}
        </p>
      )}
      <TextField.Root placeholder='Title' {...register('title')}>
      </TextField.Root>
      <TextArea placeholder='Description' className='my-5' {...register('description')}></TextArea>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit New Issue'}
      </Button>
    </form>
  )
}

export default NewIssuePage