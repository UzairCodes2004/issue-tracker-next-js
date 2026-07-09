"use client";
import React, { useState } from "react";
import { TextField, Button } from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import { signIn, getSession } from "next-auth/react"; // 👈 add getSession
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsSubmitting(true);
      setError("");

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      setIsSubmitting(false);

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        // ✅ Get session to check role
        const session = await getSession();
        const role = (session?.user as any)?.role;

        // ✅ Redirect based on role
        if (role === "SUPERADMIN" || role === "MANAGER") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      setIsSubmitting(false);
      setError("An unexpected error occurred. Please try again.");
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
          <label className="text-xs font-semibold text-slate-500 block mb-1">
            Email address
          </label>
          <TextField.Root
            type="email"
            placeholder="email@example.com"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">
            Password
          </label>
          <div className="relative">
            <TextField.Root
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              {...register("password", { required: "Password is required" })}
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <FiEyeOff className="w-5 h-5" />
              ) : (
                <FiEye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>

        <div className="relative flex py-2 items-center">
          <div className="grow border-t border-slate-200"></div>
          <span className="shrink mx-4 text-slate-400 text-xs uppercase">
            Or
          </span>
          <div className="grow border-t border-slate-200"></div>
        </div>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="flex items-center justify-center gap-2 border border-slate-200 rounded-lg py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>

        <p className="text-sm text-slate-500 mt-2 text-center">
          Don't have an account?{" "}
          <Link href="/register" className="text-indigo-600 hover:underline">
            Register
          </Link>
        </p>
        <p className="text-sm text-slate-500 mt-2 text-center">
          Forgot your password?{" "}
          <Link
            href="/forgot-password"
            className="text-indigo-600 hover:underline"
          >
            Forgot Password
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;