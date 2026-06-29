'use client';
import React, { useState } from 'react';
import { TextField, Button } from '@radix-ui/themes';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      setIsSubmitting(false);

      if (result?.error) {
        setError('Invalid email or password.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setIsSubmitting(false);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100 mt-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Log In</h1>

      {error && (
        <p className="bg-red-50 text-red-600 border border-red-100 text-sm p-3 rounded-lg mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Email address</label>
          <TextField.Root
            type="email"
            placeholder="email@example.com"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">Password</label>
          <div className="relative">
            <TextField.Root
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••"
              {...register('password', { required: 'Password is required' })}
              className="w-full pr-10" // space for the eye icon
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

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>

        <p className="text-sm text-slate-500 mt-4 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-indigo-600 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;