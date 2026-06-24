'use client'
import { TextField, TextArea, Button } from '@radix-ui/themes'
import React, { useState } from 'react' // 1. Imported useState
import { useForm } from "react-hook-form";
import axios from 'axios'
import { useRouter } from 'next/navigation';

interface IssueForm {
  title: string;
  description: string;
}

const NewIssuePage = () => {
  const router = useRouter()
  const { register, handleSubmit } = useForm<IssueForm>();
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const onSubmit = async (data: IssueForm) => {
    try {
      setIsSubmitting(true);
      await axios.post('/api/issues', data);


      router.push('/issues');
    } catch (error) {
      setIsSubmitting(false);
      console.error("Failed to submit issue:", error);

    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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