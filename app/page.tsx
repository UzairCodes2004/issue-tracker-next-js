'use client';

import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export default function Home() {
    return (
        <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
           
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                    <span className="text-white text-3xl font-bold">IT</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800">IssueTracker</h1>
                <p className="text-gray-500 mt-2 text-lg">The simplest way to track your issues</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <a
                    href="/login"
                    className="flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 px-6 py-3 rounded-xl font-medium hover:shadow-md transition-shadow"
                >
                    <FaSignInAlt /> Log In
                </a>
                <a
                    href="/register"
                    className="flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                    <FaUserPlus /> Sign Up
                </a>
            </div>

            {/* Optional small note */}
            <p className="text-gray-400 text-sm mt-6">Start managing your issues in seconds</p>
        </main>
    );
}