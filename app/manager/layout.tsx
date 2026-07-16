"use client";

import { useSession, signOut } from "next-auth/react"; // 👈 Add signOut
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; // 👈 Add useState
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Import permission hook ──────────────────────────────────────────────
import { useRole } from "../hooks/useRole";

function ManagerSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/manager", label: "Dashboard", icon: "📊" },
    { href: "/manager/issues", label: "Issues", icon: "📋" },
    { href: "/manager/comments", label: "Comments", icon: "💬" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-amber-600">Manager Panel</h1>
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
                  ? "bg-amber-50 text-amber-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200 space-y-2">
        <Link
          href="/issues"
          className="block text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to App
        </Link>
      </div>
    </aside>
  );
}

function ManagerHeader() {
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
        <h2 className="text-lg font-semibold text-slate-800">Manager Dashboard</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">
            {session?.user?.name || "Manager"}
          </span>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            MANAGER
          </span>
          {/* ─── Logout Button ───────────────────────────────────────────── */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-sm text-red-500 hover:text-red-700 transition-colors cursor-pointer"
          >
            Logout
          </button>
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

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ─── Permission hook ──────────────────────────────────────────────────
  const { isManager, isLoading } = useRole();

  useEffect(() => {
    // Wait for session to load
    if (status === "loading" || isLoading) return;

    // Not authenticated → redirect to login
    if (!session) {
      router.push("/login");
      return;
    }

    // Not MANAGER → redirect to dashboard
    if (!isManager) {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router, isManager, isLoading]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!session || !isManager) return null;

  return (
    <div className="flex h-screen bg-slate-50">
      <ManagerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ManagerHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}