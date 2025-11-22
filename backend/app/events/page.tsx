'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { trpc } from '@/lib/trpc-client';
import { format } from 'date-fns';

export default function EventsPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: events, refetch } = trpc.events.get.useQuery({ includePublic: true });
  const createMutation = trpc.events.create.useMutation();
  const updateMutation = trpc.events.update.useMutation();
  const deleteMutation = trpc.events.delete.useMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    category: '',
    isPublic: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...formData,
        startTime: formData.startTime || undefined,
        endDate: formData.endDate || undefined,
        endTime: formData.endTime || undefined,
        location: formData.location || undefined,
        category: formData.category || undefined,
      });
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: '',
        endDate: '',
        endTime: '',
        location: '',
        category: '',
        isPublic: false,
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            {showForm ? 'Cancel' : '+ New Event'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create Event</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Make this event public</span>
                </label>
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
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Your Events</h2>
            {events && events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event: { id: string; title: string; description: string | null; startDate: string; startTime: string | null; location: string | null; category: string | null; isPublic: boolean }) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                        {event.isPublic && (
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            Public
                          </span>
                        )}
                        {event.category && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            {event.category}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                      )}
                      <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        {format(new Date(event.startDate), 'MMM d, yyyy')}
                        {event.startTime && ` at ${event.startTime}`}
                        {event.location && ` • ${event.location}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded ml-4"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No events yet. Create one to get started!</p>
            )}
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}

