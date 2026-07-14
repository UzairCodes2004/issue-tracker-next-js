'use client';
import React, { ReactNode, useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';

const SessionSync = () => {
  const { data: session } = useSession();

  useEffect(() => {
    // ✅ Now `session.accessToken` is fully typed!
    if (session?.accessToken) {
      localStorage.setItem("token", session.accessToken);
    } else if (session === null) {
      localStorage.removeItem("token");
    }
  }, [session]);

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