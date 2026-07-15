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
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col">
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
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
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

function AdminHeader() {
  const { data: session } = useSession();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
    setIsLoggingOut(false);
  };

  return (
    <>

      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Dashboard</h2>

        {/* ─── User Dropdown (same as NavBar) ───────────────────────────── */}
        <div className="flex items-center gap-3">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <button className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-full">
                <Avatar
                  src={session?.user?.image || undefined}
                  fallback={session?.user?.name?.charAt(0) || "A"}
                  size="2"
                  radius="full"
                  className="cursor-pointer border-2 border-transparent hover:border-indigo-300 transition-all"
                />
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {session?.user?.name || "Admin"}
                </span>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content align="end" className="w-48">
              <DropdownMenu.Item>
                <Link href={`/users/${session?.user?.id}`} className="w-full">
                  Profile
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Separator />

              <DropdownMenu.Item
                color="red"
                onClick={() => setShowLogoutConfirm(true)}
                className="cursor-pointer"
              >
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </header>

      {/* ─── Logout Confirmation Modal ────────────────────────────────────── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Logout?</h2>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to logout of your account?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-150 disabled:opacity-50"
              >
                {isLoggingOut ? "Logging out..." : "Yes, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}