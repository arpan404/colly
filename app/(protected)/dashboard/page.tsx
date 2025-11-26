'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Bell, BookOpen, Lightbulb, Brain, BarChart3, Clock, Hand, ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { trpc } from '@/lib/trpc-client';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { useState, useEffect, useMemo } from 'react';

const productivityTips = [
  {
    text: "Drink water, sleep enough, and move a little every day — your brain works best when your body feels good.",
    icon: Brain
  },
  {
    text: "Break large tasks into smaller, manageable chunks. Progress compounds when you build momentum.",
    icon: BarChart3
  },
  {
    text: "Review your flashcards regularly using spaced repetition. Consistent practice beats cramming.",
    icon: BookOpen
  },
  {
    text: "Set specific, measurable goals for your study sessions. Track what works and adjust accordingly.",
    icon: Lightbulb
  },
  {
    text: "Take short breaks between study sessions. The Pomodoro Technique (25+5) can boost productivity.",
    icon: Clock
  },
  {
    text: "Create a dedicated study space free from distractions. Your environment shapes your focus.",
    icon: Hand
  },
  {
    text: "Track your expenses weekly. Small savings add up to big financial freedom over time.",
    icon: BarChart3
  },
  {
    text: "Establish morning routines that set a positive tone for your entire day.",
    icon: Calendar
  }
];

export default function DashboardPage() {
  const { data, isLoading } = trpc.dashboard.get.useQuery();
  const { data: eventsData } = trpc.events.get.useQuery({ includePublic: true });
  const { data: userPreferences } = trpc.user.preferences.get.useQuery();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    // Shuffle to a new tip every hour
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % productivityTips.length);
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  // Compute events for selected date from eventsData
  const upcomingEvents = useMemo(() => {
    if (!eventsData) return [];
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);
    
    return eventsData
      .filter(event => {
        // Parse date string as local date to avoid timezone issues
        const [year, month, day] = event.startDate.split('-').map(Number);
        const eventDate = new Date(year, month - 1, day);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === targetDate.getTime();
      })
      .sort((a, b) => {
        // Sort by time if available, otherwise by title
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return a.title.localeCompare(b.title);
      });
  }, [eventsData, selectedDate]);

  const currentTip = productivityTips[currentTipIndex];
  const TipIcon = currentTip.icon;

  if (isLoading) {
    return (
      
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
          </div>
          <div className="ml-3 text-muted-foreground">Loading your dashboard...</div>
        </div>
      
    );
  }

  return (
    
      <div className="min-h-screen bg-linear-to-br from-background via-background/95 to-background/90">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Modern Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Dashboard
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground">Welcome back! Here's what's happening with your productivity today.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <NotificationsDropdown />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tip of the hour - Modern Card */}
              <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative z-10 p-4 sm:p-6 lg:p-8">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                      <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h2 className="text-lg sm:text-xl font-semibold text-primary">Tip of the hour</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentTipIndex((prevIndex) => (prevIndex + 1) % productivityTips.length)}
                          className="text-primary hover:bg-primary/10 h-8 w-8 p-0"
                          title="Next tip"
                        >
                          <Lightbulb className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-3 sm:p-4 bg-white/50 dark:bg-black/20 rounded-lg border border-primary/10 backdrop-blur-sm">
                        <p className="text-sm sm:text-base text-foreground/90 leading-relaxed flex items-center gap-2">
                          {currentTip.text}
                          <TipIcon className="w-4 h-4 text-primary inline shrink-0" />
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>              {/* Budget Analytics - Modern Card */}
              <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative z-10 p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold">Budget Analytics</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className={`w-2 h-2 rounded-full ${
                        data?.budgetBreakdown?.some(item => Number(item.spent) > Number(item.budgeted))
                          ? 'bg-destructive'
                          : Number(data?.budgetSummary.totalSpent || 0) > Number(data?.budgetSummary.totalBudget || 0) * 0.9
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}></div>
                      <span className="hidden sm:inline text-xs sm:text-sm">
                        {data?.budgetBreakdown?.some(item => Number(item.spent) > Number(item.budgeted))
                          ? 'Over Budget'
                          : Number(data?.budgetSummary.totalSpent || 0) > Number(data?.budgetSummary.totalBudget || 0) * 0.9
                          ? 'Near Limit'
                          : 'On Track'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="h-48 sm:h-64 bg-linear-to-br from-secondary/20 to-secondary/10 rounded-xl border-2 border-dashed border-secondary/30 mb-4 sm:mb-6 hover:border-primary/30 transition-colors duration-300 p-2 sm:p-4">
                    {data?.budgetBreakdown && data.budgetBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data.budgetBreakdown.map(item => ({
                            category: item.category,
                            budgeted: Number(item.budgeted),
                            spent: Number(item.spent),
                            remaining: Math.max(0, Number(item.budgeted) - Number(item.spent)),
                            overBudget: Math.max(0, Number(item.spent) - Number(item.budgeted)),
                            isOverBudget: Number(item.spent) > Number(item.budgeted)
                          }))}
                          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                          <XAxis
                            dataKey="category"
                            stroke="var(--color-muted-foreground)"
                            fontSize={10}
                            tick={{ fill: 'var(--color-muted-foreground)' }}
                            angle={-45}
                            textAnchor="end"
                            height={50}
                            interval={0}
                          />
                          <YAxis
                            stroke="var(--color-muted-foreground)"
                            fontSize={10}
                            tick={{ fill: 'var(--color-muted-foreground)' }}
                            tickFormatter={(value) => formatCurrency(Number(value), userPreferences?.currency)}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--color-card)',
                              border: '1px solid var(--color-border)',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                              fontSize: '12px'
                            }}
                            formatter={(value, name) => [
                              formatCurrency(Number(value), userPreferences?.currency),
                              name === 'budgeted' ? 'Budgeted' :
                              name === 'spent' ? 'Spent' : name
                            ]}
                            labelStyle={{ color: 'var(--color-foreground)', fontWeight: 'bold' }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: '10px', color: 'var(--color-muted-foreground)' }}
                          />
                          <Bar
                            dataKey="spent"
                            name="Spent"
                            fill="var(--color-primary)"
                            radius={[2, 2, 0, 0]}
                            opacity={0.8}
                          />
                          <Bar
                            dataKey="budgeted"
                            name="Budgeted"
                            fill="var(--color-muted)"
                            radius={[2, 2, 0, 0]}
                            opacity={0.6}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
                          <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        </div>
                        <p className="text-muted-foreground font-medium text-sm sm:text-base">No budget data</p>
                        <p className="text-xs text-muted-foreground mt-1">Create budgets to see analytics</p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-6">
                    <div className="p-3 sm:p-4 bg-linear-to-br from-secondary/30 to-secondary/20 rounded-lg border border-secondary/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Spent</p>
                      <p className="text-lg sm:text-2xl font-bold text-foreground">
                        {formatCurrency(Number(data?.budgetSummary.totalSpent || 0), userPreferences?.currency)}
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-linear-to-br from-secondary/30 to-secondary/20 rounded-lg border border-secondary/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Budget</p>
                      <p className="text-lg sm:text-2xl font-bold text-foreground">
                        {formatCurrency(Number(data?.budgetSummary.totalBudget || 0), userPreferences?.currency)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Flashcards - Modern Section */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Recent Flashcards</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data?.recentFlashcards && data.recentFlashcards.length > 0 ? (
                    data.recentFlashcards.slice(0, 2).map((card: { id: string; front: string; deckTitle: string }) => (
                      <Card key={card.id} className="group relative overflow-hidden border-0 shadow-lg bg-linear-to-br from-secondary/20 to-secondary/10 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <CardContent className="relative z-10 p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                              <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground mb-2">{card.front}</p>
                              <p className="text-sm text-muted-foreground">{card.deckTitle}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="group relative overflow-hidden border-2 border-dashed border-secondary/40 shadow-lg bg-linear-to-br from-secondary/20 to-secondary/10 backdrop-blur-sm hover:shadow-xl transition-all duration-300 md:col-span-2">
                      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <CardContent className="relative z-10 p-8">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <BookOpen className="w-8 h-8 text-primary" />
                          </div>
                          <p className="text-muted-foreground font-medium">No recent flashcards</p>
                          <p className="text-xs text-muted-foreground mt-1">Create some flashcards to get started!</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Quick Actions - Modern Section */}
              <div>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <Link href="/flashcards" className="block">
                    <Button variant="outline" className="group h-16 sm:h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 hover:scale-105 hover:shadow-lg w-full">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-linear-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <span className="text-xs sm:text-sm">Flashcards</span>
                    </Button>
                  </Link>
                  <Link href="/budgets" className="block">
                    <Button variant="outline" className="group h-16 sm:h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 hover:scale-105 hover:shadow-lg w-full">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-linear-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <span className="text-xs sm:text-sm">Budgets</span>
                    </Button>
                  </Link>
                  <Link href="/social-hub" className="block">
                    <Button variant="outline" className="group h-16 sm:h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 w-full hover:scale-105 hover:shadow-lg">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-linear-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <span className="text-xs sm:text-sm">Social Hub</span>
                    </Button>
                  </Link>
                  <Link href="/wellness" className="block">
                    <Button variant="outline" className="group h-16 sm:h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 w-full hover:scale-105 hover:shadow-lg">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-linear-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <span className="text-xs sm:text-sm">Wellness</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right sidebar - Upcoming Events */}
            <div className="space-y-4 sm:space-y-6">
              {/* Right sidebar - Upcoming Events - Modern Card */}
              <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative z-10 p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center shadow-sm">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold">
                      {isSameDay(selectedDate, new Date()) ? "Today's Events" : `Events for ${format(selectedDate, 'MMM d, yyyy')}`}
                    </h2>
                  </div>

                  {/* Calendar placeholder */}
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-linear-to-br from-secondary/20 to-secondary/10 rounded-xl border border-secondary/30 hover:border-primary/30 transition-colors duration-300">
                    <div className="text-center">
                      <div className="flex items-center justify-between mb-4">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium text-muted-foreground">
                          {format(currentMonth, 'MMMM yyyy')}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-xs">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                          <div key={i} className="text-center text-muted-foreground py-1 font-medium">{day}</div>
                        ))}
                        {(() => {
                          const monthStart = startOfMonth(currentMonth);
                          const monthEnd = endOfMonth(monthStart);
                          const startDate = startOfWeek(monthStart);
                          const endDate = endOfWeek(monthEnd);
                          
                          const days = eachDayOfInterval({ start: startDate, end: endDate });

                          return days.map((day, i) => {
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isTodayDate = isToday(day);
                            const isSelectedDate = isSameDay(day, selectedDate);
                            const hasEvent = eventsData?.some(event => {
                              const [year, month, dayNum] = event.startDate.split('-').map(Number);
                              const eventDate = new Date(year, month - 1, dayNum);
                              return isSameDay(eventDate, day);
                            });

                            return (
                              <button
                                key={i}
                                onClick={() => setSelectedDate(day)}
                                className={`
                                  text-center py-1 text-xs relative flex items-center justify-center
                                  rounded-md transition-all duration-200
                                  ${!isCurrentMonth ? 'text-muted-foreground/30' : 'hover:bg-secondary cursor-pointer'}
                                  ${isTodayDate ? 'ring-2 ring-primary ring-inset' : ''}
                                  ${isSelectedDate ? 'bg-primary text-primary-foreground font-bold' : ''}
                                `}
                              >
                                {format(day, 'd')}
                                {hasEvent && !isSelectedDate && isCurrentMonth && (
                                  <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary"></div>
                                )}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Events list */}
                  <div className="space-y-3">
                    {upcomingEvents && upcomingEvents.length > 0 ? (
                      upcomingEvents.map((event: { id: string; title: string; startDate: string; startTime: string | null }) => (
                        <div key={event.id} className="group/item flex items-start gap-3 p-3 sm:p-4 bg-linear-to-r from-secondary/30 to-secondary/20 rounded-lg hover:bg-secondary/40 transition-all duration-200 hover:scale-[1.02] border border-secondary/30 hover:border-primary/30">
                          <div className="w-3 h-3 rounded-full bg-primary mt-1.5 shrink-0 group-hover/item:scale-110 transition-transform duration-200"></div>
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
                      <div className="text-center py-6 sm:py-8">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        </div>
                        <p className="text-muted-foreground font-medium text-sm sm:text-base">No events today</p>
                        <p className="text-xs text-muted-foreground mt-1">Your schedule is clear!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          </div>
      </div>
    
  );
}

