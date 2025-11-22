'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { trpc } from '@/lib/trpc-client';
import { format } from 'date-fns';

export default function WellnessPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: logs, refetch } = trpc.wellness.logs.get.useQuery({ limit: 30 });
  const createMutation = trpc.wellness.logs.create.useMutation();
  const updateMutation = trpc.wellness.logs.update.useMutation();

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    mood: 3,
    sleepHours: 8,
    waterGlasses: 8,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...formData,
        mood: formData.mood || undefined,
        sleepHours: formData.sleepHours || undefined,
        waterGlasses: formData.waterGlasses || undefined,
        notes: formData.notes || undefined,
      });
      setShowForm(false);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        mood: 3,
        sleepHours: 8,
        waterGlasses: 8,
        notes: '',
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wellness Tracking</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            {showForm ? 'Cancel' : '+ Log Entry'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Log Wellness Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mood (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1 (Poor)</span>
                  <span className="font-semibold">{formData.mood}</span>
                  <span>5 (Great)</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sleep Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={formData.sleepHours}
                  onChange={(e) => setFormData({ ...formData, sleepHours: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Water Glasses
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.waterGlasses}
                  onChange={(e) => setFormData({ ...formData, waterGlasses: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
              >
                Log Entry
              </button>
            </div>
          </form>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Wellness Logs</h2>
            {logs && logs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {logs.map((log: { id: string; date: string; mood: number | null; sleepHours: string | null; waterGlasses: number | null; notes: string | null }) => (
                  <div
                    key={log.id}
                    className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg"
                  >
                    <div className="font-semibold text-gray-900 dark:text-white mb-2">
                      {format(new Date(log.date), 'MMM d, yyyy')}
                    </div>
                    <div className="space-y-2 text-sm">
                      {log.mood && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Mood:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {log.mood}/5
                            {' '}
                            {'⭐'.repeat(log.mood)}
                          </span>
                        </div>
                      )}
                      {log.sleepHours && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Sleep:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {Number(log.sleepHours)} hours
                          </span>
                        </div>
                      )}
                      {log.waterGlasses && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Water:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {log.waterGlasses} glasses
                          </span>
                        </div>
                      )}
                      {log.notes && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-gray-600 dark:text-gray-400 text-xs">{log.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No wellness logs yet. Create one to get started!</p>
            )}
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}

