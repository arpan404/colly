'use client';

import Link from 'next/link';
import { Navbar } from '@/components/navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Colly
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Your personal productivity companion. Manage routines, budgets, events, wellness, and flashcards all in one place.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
