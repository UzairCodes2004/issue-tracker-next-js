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

        <div className="relative flex py-2 items-center">
          <div className="grow border-t border-slate-200"></div>
          <span className="shrink mx-4 text-slate-400 text-xs uppercase">Or</span>
          <div className="grow border-t border-slate-200"></div>
        </div>

        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="flex items-center justify-center gap-2 border border-slate-200 rounded-lg py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.437-2.883-6.437-6.437 0-3.555 2.882-6.437 6.437-6.437 1.488 0 2.85.508 3.93 1.358l3.053-3.053C18.9 2.057 15.775 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.895 0 10.865-4.225 10.865-11.24 0-.693-.06-1.378-.176-1.955H12.24z"
            />
          </svg>
          Sign in with Google
        </button>

        <p className="text-sm text-slate-500 mt-2 text-center">
          Dont have an account?{' '}
          <Link href="/register" className="text-indigo-600 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;