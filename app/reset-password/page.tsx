"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import {getApiErrorMessage, resetPassword, validateResetToken} from "../services/usersService";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
type ResetPasswordForm = {
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const encodedData = searchParams.get("data");

  const [lockedData, setLockedData] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({ mode: "onSubmit" });

  // 1. Reload on data change (client‑side navigation only)
  const prevDataRef = useRef<string | null>(null);
  useEffect(() => {
    const current = encodedData ?? null;
    if (prevDataRef.current !== null && prevDataRef.current !== current) {
      window.location.href = window.location.href;
    }
    prevDataRef.current = current;
  }, [encodedData]);

  // 2. Lock the data and reset validation state
  useEffect(() => {
    if (encodedData) {
      setLockedData(encodedData);
      setLinkError(null);
    } else {
      setLockedData(null);
      setLinkError("Invalid reset link. Please request a new one.");
      setIsValidating(false);
    }
  }, [encodedData]);

  // 3. Validate the token – runs only when lockedData changes
  useEffect(() => {
    if (!lockedData) {
      if (isValidating) setIsValidating(false);
      return;
    }

    let cancelled = false;

    async function verifyLink() {
      try {
        const result = await validateResetToken(lockedData!);
        if (!cancelled) {
          if (result.valid) {
            setLinkError(null);
          } else {
            setLinkError("Invalid or expired reset link. Please request a new one.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setLinkError(
            getApiErrorMessage(
              err,
              "Invalid or expired reset link. Please request a new one.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setIsValidating(false);
        }
      }
    }

    setIsValidating(true);
    verifyLink();

    return () => {
      cancelled = true;
    };
  }, [lockedData]);

  // 4. Submit handler
  const onSubmit = async (data: ResetPasswordForm) => {
    if (!lockedData) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await resetPassword(lockedData, data.newPassword);
      setMessage(response.message || "Password reset successfully!");
      setTimeout(() => router.push("/login?reset=success"), 3000);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Failed to reset password. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Render states
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Validating reset link...
      </div>
    );
  }

  if (!lockedData || linkError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm p-6 space-y-4 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-red-600">Invalid Reset Link</h2>
          <p className="text-sm text-gray-600">
            {linkError ||
              "The reset link is missing required information. Please request a new one."}
          </p>
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Request new reset link
          </a>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm p-6 space-y-4 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-green-600">
            Password Reset Successful
          </h2>
          <p className="text-sm text-gray-600">{message}</p>
          <p className="text-xs text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // 6. Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm p-6 space-y-5 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-center text-gray-800">
          Create New Password
        </h2>
        <p className="text-center text-sm text-gray-600">
          Enter your new password below.
        </p>

        {error && (
          <div className="p-2.5 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password field */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <div className="relative mt-1">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                {...register("newPassword", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  validate: (value) =>
                    value === watch("confirmPassword") ||
                    "Passwords do not match",
                })}
                className={`block w-full px-3 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-10 ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watch("newPassword") || "Passwords do not match",
                })}
                className={`block w-full px-3 py-1.5 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-10 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a
            href="/login"
            className="inline-block w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}