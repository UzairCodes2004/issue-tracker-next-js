'use client'
import { TextField, TextArea, Button } from '@radix-ui/themes'
import React from 'react'
import { useForm } from "react-hook-form";
import axios from 'axios'
import { useRouter } from 'next/navigation';

interface IssueForm{
    title: string,
    description: string;
}

const NewIssuePage = () => {
    const router = useRouter()
    const { register, handleSubmit } = useForm<IssueForm>() ;

    const onSubmit = async (data: IssueForm) => {
       await axios.post('/api/issues',data);
    
    }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField.Root placeholder='Title' {...register('title')}>
      </TextField.Root>
      <TextArea placeholder='Description' className='my-5' {...register('description')}></TextArea>
      <Button type="submit">Submit New Issue</Button>
    </form>
  )
}

export default NewIssuePage
