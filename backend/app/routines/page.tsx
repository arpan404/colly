'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { trpc } from '@/lib/trpc-client';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function RoutinesPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: routines, refetch } = trpc.routines.get.useQuery();
  const createMutation = trpc.routines.create.useMutation();
  const updateMutation = trpc.routines.update.useMutation();
  const deleteMutation = trpc.routines.delete.useMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    isRecurring: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        isRecurring: true,
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this routine?')) {
      try {
        await deleteMutation.mutateAsync({ id });
        refetch();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Routines</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            {showForm ? 'Cancel' : '+ New Routine'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create Routine</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    {DAYS.map((day, idx) => (
                      <option key={idx} value={idx}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recurring
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Your Routines</h2>
            {routines && routines.length > 0 ? (
              <div className="space-y-4">
                {routines.map((routine: { id: string; title: string; description: string | null; dayOfWeek: number; startTime: string; endTime: string; isRecurring: boolean }) => (
                  <div
                    key={routine.id}
                    className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg flex justify-between items-start"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{routine.title}</h3>
                      {routine.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{routine.description}</p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        {DAYS[routine.dayOfWeek]} • {routine.startTime} - {routine.endTime}
                        {routine.isRecurring && ' • Recurring'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(routine.id)}
                      className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No routines yet. Create one to get started!</p>
            )}
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}

