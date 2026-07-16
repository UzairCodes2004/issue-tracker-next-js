'use client';

import React, { useState } from 'react';
import { TextField, Button } from '@radix-ui/themes';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { RegisterPayload, registerUser } from '@/app/services/usersService';
import { formatApiError } from '../utils/error-utils';

// ─── Local type (no import from role.ts) ──────────────────────────────
type RequestedRole = 'USER' | 'MANAGER';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  requestedRole: RequestedRole;
  managerReason?: string;
}

const RegisterPage = () => {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedRole = watch('requestedRole');

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccessMessage(null);

      // Register the user – backend will create manager request if requested
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        requestedRole: data.requestedRole,
        ...(data.requestedRole === 'MANAGER' && data.managerReason
          ? { managerReason: data.managerReason }
          : {}),
      }as RegisterPayload);

      // If they requested MANAGER, show success message (no auto-login)
      if (data.requestedRole === 'MANAGER') {
        setSuccessMessage(
          'Your account has been created and your manager request is pending approval.'
        );
        setIsSubmitting(false);
        return;
      }

      // Regular USER – redirect to login
      router.push('/login?registered=true');
    } catch (err) {
      setIsSubmitting(false);
      setError(formatApiError(err));
    }
  };

  // ─── Success state – show pending approval message ──────────────────────
  if (successMessage) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100 mt-10">
        <div className="text-center">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Manager Request Submitted!</h1>
          <p className="text-slate-600 mb-4">{successMessage}</p>
          <p className="text-sm text-slate-500">
            You can log in now with your USER account and check your request status.
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100 mt-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Create Account</h1>

      {error && (
        <p className="bg-red-50 text-red-600 border border-red-100 text-sm p-3 rounded-lg mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Name</label>
          <TextField.Root
            placeholder="John Doe"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Email address</label>
          <TextField.Root
            type="email"
            placeholder="email@example.com"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Password</label>
          <div className="relative">
            <TextField.Root
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {/* ─── Role dropdown ──────────────────────────────────────────────── */}
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">
            Requested Role
          </label>
          <select
            {...register('requestedRole', { required: 'Please select a role' })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="USER">User</option>
            <option value="MANAGER">Manager (requires approval)</option>
          </select>
          {errors.requestedRole && (
            <p className="text-red-500 text-xs mt-1">{errors.requestedRole.message}</p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            {selectedRole === 'MANAGER'
              ? 'Manager role requires approval from a Super Admin.'
              : 'User role grants you standard access.'}
          </p>
        </div>

        {/* ─── Manager Reason (only shown if MANAGER selected) ───────────── */}
        {selectedRole === 'MANAGER' && (
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">
              Why do you want to become a manager? <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Describe your experience and reasons..."
              className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              {...register('managerReason', {
                required: selectedRole === 'MANAGER' ? 'Please provide a reason' : false,
              })}
            />
            {errors.managerReason && (
              <p className="text-red-500 text-xs mt-1">{errors.managerReason.message}</p>
            )}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? 'Registering...' : 'Register'}
        </Button>

        <p className="text-sm text-slate-500 mt-4 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;