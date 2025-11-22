'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc-client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const loginMutation = trpc.auth.login.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await loginMutation.mutateAsync({ email, password });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Welcome Back
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

