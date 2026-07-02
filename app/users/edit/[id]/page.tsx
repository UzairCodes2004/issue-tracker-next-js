'use client';
import React, { useState, useEffect, use } from 'react';
import { TextField, Button } from '@radix-ui/themes';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useSession } from "next-auth/react";
import { updateUser,getUserById } from '@/app/services/usersService';


interface EditUserForm {
  name: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

type UserProfile = {
  id: number;
  name: string;
  email: string;
};

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<EditUserForm>();
  const [user, setUser] = useState<UserProfile>();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { data: session, update } = useSession()
  useEffect(() => {
    
      getUserById(id)
      .then((res) => setUser(res.data))
      .catch(() => setError('Failed to load profile data.'))
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (data: EditUserForm) => {
    if (!user) return;
    try {
      setIsSubmitting(true);
      setError('');

      await axios.put(`http://localhost:5000/users/${id}`, {
        name: data.name,
        email: data.email,
        password: data.newPassword,
      });
      await update({
        name: data.name,
        email: data.email,
        password: data.newPassword
      });
      router.push(`/users/${id}`);
    } catch (err) {
      setIsSubmitting(false);
      setError('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return <p className="text-slate-500 p-6">Loading profile...</p>;
  }

  if (!user) {
    return <p className="text-red-500 p-6">{error || 'User not found.'}</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100">
      <Link href={`/users/${id}`} className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← Back to Profile
      </Link>

      <h1 className="text-xl font-bold text-slate-800 mb-6">Edit Profile</h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Name</label>
          <TextField.Root
            placeholder="Enter name"
            defaultValue={user.name}
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Email</label>
          <TextField.Root
            type="email"
            placeholder="Enter email"
            defaultValue={user.email}
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">New Password</label>
          <TextField.Root
            type="password"
            placeholder="Enter new password"
            {...register('newPassword', {
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
          />
          {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Confirm New Password</label>
          <TextField.Root
            type="password"
            placeholder="Repeat new password"
            {...register('confirmPassword', {
              validate: (value) =>
                !watch('newPassword') || value === watch('newPassword') || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button asChild variant="soft">
            <Link href={`/users/${id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}