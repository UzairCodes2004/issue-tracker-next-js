'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { FaRocket, FaChartLine, FaShieldAlt } from 'react-icons/fa';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-77px)] flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="animate-pulse text-slate-500 font-medium">Loading…</div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <main className="relative overflow-hidden min-h-[calc(100vh-77px)] flex items-center justify-center px-4 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-linear-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-linear-to-tl from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center mask-[radial-gradient(ellipse_at_center,white,transparent)] opacity-20" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-xl shadow-blue-500/25 mb-8">
          <span className="text-white text-5xl font-black tracking-tight">IT</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          IssueTracker
        </h1>
        <p className="text-xl text-gray-500 mt-4 max-w-2xl mx-auto">
          The simplest way to track your issues, collaborate with your team, and ship faster.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
          >
            <FaRocket className="group-hover:translate-x-1 transition-transform" />
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl font-semibold text-gray-700 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Log in →
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
          <div className="flex items-start gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 shadow-sm">
            <FaChartLine className="text-indigo-500 text-2xl mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">Track Progress</h3>
              <p className="text-sm text-gray-500">Visualize your project status at a glance.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 shadow-sm">
            <FaShieldAlt className="text-indigo-500 text-2xl mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">Secure & Private</h3>
              <p className="text-sm text-gray-500">Your data is encrypted and safe with us.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 shadow-sm">
            <FaRocket className="text-indigo-500 text-2xl mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800">Fast & Intuitive</h3>
              <p className="text-sm text-gray-500">Designed for speed and simplicity.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating blobs animation – add to global CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, -20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}