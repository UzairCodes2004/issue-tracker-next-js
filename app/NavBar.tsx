"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";
import { FaBug, FaBars, FaTimes } from "react-icons/fa";
import { Avatar, DropdownMenu } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

const NavBar = () => {
  const pathname = usePathname();
  const { status, data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ─── HIDE on admin routes ──────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isAdmin =
    (session?.user)?.role === "SUPERADMIN";

       const isManager=(session?.user)?.role==="MANAGER";
  // ─── Navigation links ──────────────────────────────────────────────────
  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/issues", label: "Issues" },
  ];

  // Add Admin Panel link if user is admin
  if (isAdmin) {
    navLinks.push({ href: "/admin", label: "Admin Panel" });
  }

  if(isManager)
  {
    navLinks.push({href:"/manager",label:"Manager Panel"})
  }

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 px-5 h-16 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 text-xl font-bold text-indigo-600"
      >
        <FaBug className="text-2xl" />
        <span className="hidden sm:inline">IssueTracker</span>
      </Link>

      {/* Desktop Navigation */}
      <ul className="hidden md:flex items-center gap-6 text-sm font-medium">
        {navLinks.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`relative pb-1 transition-colors ${
                pathname === href || pathname.startsWith(href + "/")
                  ? "text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {label}
              {pathname === href && (
                <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />
              )}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right side: User / Auth */}
      <div className="flex items-center gap-4">
        {status === "loading" && (
          <span className="text-sm text-gray-400 animate-pulse">Loading…</span>
        )}

        {status === "authenticated" && session?.user && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <button className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-full">
                <Avatar
                  src={session.user.image || undefined}
                  fallback={session.user.name?.charAt(0) || "U"}
                  size="2"
                  radius="full"
                  className="cursor-pointer border-2 border-transparent hover:border-indigo-300 transition-all"
                />
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {session.user.name}
                </span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" className="w-48">
              <DropdownMenu.Item>
                <Link
                  href={`/users/${(session.user).id}`}
                  className="w-full"
                >
                  Profile
                </Link>
              </DropdownMenu.Item>
              {isAdmin && (
                <DropdownMenu.Item>
                  <Link href="/admin" className="w-full">
                    Admin Panel
                  </Link>
                </DropdownMenu.Item>
              )}
              {isManager && (
                <DropdownMenu.Item>
                  <Link href="/manager" className="w-full">
                    Manager Panel
                  </Link>
                </DropdownMenu.Item>
              )}
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                color="red"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="cursor-pointer"
              >
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        )}

        {status === "unauthenticated" && (
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Sign up
            </Link>
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-colors shadow-sm"
            >
              SignIn with Google
            </button>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b shadow-lg md:hidden animate-slideDown">
          <ul className="flex flex-col p-4 gap-3 text-sm font-medium">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`block py-2 px-3 rounded-lg transition-colors ${
                    pathname === href || pathname.startsWith(href + "/")
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            {status === "unauthenticated" && (
              <>
                <li>
                  <Link
                    href="/login"
                    className="block py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="block py-2 px-3 bg-indigo-600 text-white rounded-lg text-center hover:bg-indigo-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
