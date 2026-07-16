"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, DropdownMenu } from "@radix-ui/themes";

// ─── Import permission hook ──────────────────────────────────────────────
import { useRole } from "../hooks/useRole";

function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/users", label: "Users", icon: "👥" },
    { href: "/admin/issues", label: "Issues", icon: "📋" },
    { href: "/admin/comments", label: "Comments", icon: "💬" },
    { href: "/admin/manager-requests", label: "Manager Requests", icon: "📋" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col sticky top-0">
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-indigo-600">Admin Panel</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <Link
          href="/issues"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to App
        </Link>
      </div>
    </aside>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { isSuperAdmin, isLoading } = useRole();

  useEffect(() => {
    if (status === "loading" || isLoading) return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (!isSuperAdmin) {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router, isSuperAdmin, isLoading]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!session || !isSuperAdmin) return null;

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}