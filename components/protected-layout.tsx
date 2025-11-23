'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not authenticated and not on auth pages, redirect to login
    if (!isAuthenticated && !pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
      router.push('/login');
    }
  }, [isAuthenticated, router, pathname]);

  // Show loading or nothing while checking authentication
  if (!isAuthenticated && !pathname.startsWith('/login') && !pathname.startsWith('/signup')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the protected content
  return <>{children}</>;
}

