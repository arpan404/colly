'use client';

import { Navbar } from '@/components/navbar';
import { trpc } from '@/lib/trpc-client';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { data, isLoading } = trpc.dashboard.get.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Budget</h3>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              ${Number(data?.budgetSummary.totalBudget || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Spent This Month</h3>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              ${Number(data?.budgetSummary.totalSpent || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Events</h3>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {data?.upcomingEvents?.length || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Flashcards</h3>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {data?.recentFlashcards?.length || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
              <Link href="/events" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                View all
              </Link>
            </div>
            {data?.upcomingEvents && data.upcomingEvents.length > 0 ? (
              <ul className="space-y-3">
                {data.upcomingEvents.map((event: { id: string; title: string; startDate: string; startTime: string | null }) => (
                  <li key={event.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                    <div className="font-medium text-gray-900 dark:text-white">{event.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(event.startDate), 'MMM d, yyyy')}
                      {event.startTime && ` at ${event.startTime}`}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No upcoming events</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Flashcards</h2>
              <Link href="/flashcards" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                View all
              </Link>
            </div>
            {data?.recentFlashcards && data.recentFlashcards.length > 0 ? (
              <ul className="space-y-3">
                {data.recentFlashcards.map((card: { id: string; front: string; deckTitle: string }) => (
                  <li key={card.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                    <div className="font-medium text-gray-900 dark:text-white">{card.front}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{card.deckTitle}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No recent flashcards</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Wellness Summary (This Week)</h2>
            <Link href="/wellness" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              View all
            </Link>
          </div>
          {data?.wellnessSummary && data.wellnessSummary.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.wellnessSummary.map((log: { id: string; date: string; mood: number | null; sleepHours: string | null; waterGlasses: number | null }) => (
                <div key={log.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {format(new Date(log.date), 'MMM d')}
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {log.mood && <div>Mood: {log.mood}/5</div>}
                    {log.sleepHours && <div>Sleep: {Number(log.sleepHours)}h</div>}
                    {log.waterGlasses && <div>Water: {log.waterGlasses} glasses</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No wellness logs this week</p>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}

