'use client';

import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Bell, BookOpen } from "lucide-react";
import { trpc } from '@/lib/trpc-client';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { data, isLoading } = trpc.dashboard.get.useQuery();

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
          </div>
          <div className="ml-3 text-muted-foreground">Loading your dashboard...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back! 👋</h1>
            <p className="text-muted-foreground">Here's what's happening with your productivity today.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tip of the hour */}
            <Card className="p-8 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-primary">Tip of the hour</h2>
                  <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg border border-primary/10">
                    <p className="text-foreground/90 leading-relaxed">
                      Drink water, sleep enough, and move a little every day — your brain works best when your body feels good. 💪🧠
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Budget Analytics */}
            <Card className="p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Budget Analytics</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  On track
                </div>
              </div>
              <div className="h-64 bg-linear-to-br from-secondary/20 to-secondary/10 rounded-xl flex items-center justify-center border-2 border-dashed border-secondary/30 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    📊
                  </div>
                  <p className="text-muted-foreground font-medium">Interactive Chart</p>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${Number(data?.budgetSummary.totalSpent || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${Number(data?.budgetSummary.totalBudget || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Flashcards */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Recent Flashcards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data?.recentFlashcards && data.recentFlashcards.length > 0 ? (
                  data.recentFlashcards.slice(0, 2).map((card: { id: string; front: string; deckTitle: string }) => (
                    <Card key={card.id} className="p-6 bg-linear-to-br from-secondary/20 to-secondary/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-secondary/30">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground mb-2">{card.front}</p>
                          <p className="text-sm text-muted-foreground">{card.deckTitle}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 bg-secondary/20 border-dashed border-secondary/40">
                    <div className="text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">No recent flashcards</p>
                      <p className="text-xs text-muted-foreground mt-1">Create some flashcards to get started!</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    🧠
                  </div>
                  <span className="text-sm">Quiz/Trivia</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    📊
                  </div>
                  <span className="text-sm">Budget Report</span>
                </Button>
                <Link href="/events" className="block">
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 w-full">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      📅
                    </div>
                    <span className="text-sm">Create Event</span>
                  </Button>
                </Link>
                <Link href="/routines" className="block">
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 w-full">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      ⏰
                    </div>
                    <span className="text-sm">Your Routine</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right sidebar - Upcoming Events */}
          <div className="space-y-6">
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Upcoming Events</h2>
              </div>

              {/* Calendar placeholder */}
              <div className="mb-6 p-4 bg-linear-to-br from-secondary/20 to-secondary/10 rounded-xl border border-secondary/30">
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-2">November 2025</div>
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-muted-foreground py-1">{day}</div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => (
                      <div key={i} className={`text-center py-1 ${i === 15 ? 'bg-primary text-primary-foreground rounded' : ''}`}>
                        {((i - 1) % 31) + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Events list */}
              <div className="space-y-3">
                {data?.upcomingEvents && data.upcomingEvents.length > 0 ? (
                  data.upcomingEvents.map((event: { id: string; title: string; startDate: string; startTime: string | null }) => (
                    <div key={event.id} className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/40 transition-colors duration-200">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1.5 shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground block truncate">{event.title}</span>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(event.startDate), 'MMM d, yyyy')}
                          {event.startTime && ` at ${event.startTime}`}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">No upcoming events</p>
                    <p className="text-xs text-muted-foreground mt-1">Create your first event!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

