'use client';
import React, { ReactNode, useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
const SessionSync = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session && (session as any).accessToken) {
      localStorage.setItem("token", (session as any).accessToken);
    } else if (status === 'unauthenticated') {
      // Only clear when definitively unauthenticated (not during loading)
      localStorage.removeItem("token");
    }
  }, [session, status]);

  return null;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  );
};

export default AuthProvider;
