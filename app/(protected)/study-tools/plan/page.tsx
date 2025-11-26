"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';
import {
  Target,
  Calendar,
  Settings,
  Plus,
  ChevronLeft,
  TrendingUp,
  Star,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function StudyPlan() {
  const router = useRouter();
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    targetValue: '',
    type: 'daily' as 'daily' | 'weekly' | 'monthly',
    targetUnit: 'cards' as 'minutes' | 'cards' | 'sessions',
    deadline: '',
  });

  // TRPC queries and mutations
  const { data: studyPlanStats } = trpc.studyPlans.stats.get.useQuery();
  const { data: studyGoals } = trpc.studyPlans.goals.get.useQuery();
  const { data: studySchedules } = trpc.studyPlans.schedules.get.useQuery();
  const createGoalMutation = trpc.studyPlans.goals.create.useMutation();

  // Handle create goal
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createGoalMutation.mutateAsync({
        ...goalForm,
        targetValue: parseInt(goalForm.targetValue) || 0,
      });
      setShowCreateGoal(false);
      setGoalForm({
        title: '',
        description: '',
        targetValue: '',
        type: 'daily',
        targetUnit: 'cards',
        deadline: '',
      });
      toast.success('Goal created successfully!');
    } catch (err: unknown) {
      toast.error('Failed to create goal');
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Study Plan
                  </h1>
                  <p className="text-lg text-muted-foreground">Create and manage your study goals</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Dialog open={showCreateGoal} onOpenChange={setShowCreateGoal}>
                <DialogTrigger asChild>
                  <Button className="gap-2 h-11 px-4 shadow-sm hover:shadow-md transition-all duration-200">
                    <Plus className="w-4 h-4" />
                    Set New Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md border-0 shadow-xl bg-card/95 backdrop-blur-sm">
                  <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-semibold">Create Study Goal</DialogTitle>
                        <DialogDescription>
                          Set a new study goal to track your progress
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <form onSubmit={handleCreateGoal} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-title">Goal Title</Label>
                      <Input
                        id="goal-title"
                        value={goalForm.title}
                        onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                        placeholder="e.g., Study 50 cards per day"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-description">Description</Label>
                      <Textarea
                        id="goal-description"
                        value={goalForm.description}
                        onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-type">Goal Type</Label>
                      <Select value={goalForm.type} onValueChange={(value: any) => setGoalForm({ ...goalForm, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cards_per_day">Cards per day</SelectItem>
                          <SelectItem value="minutes_per_day">Minutes per day</SelectItem>
                          <SelectItem value="sessions_per_week">Sessions per week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-target">Target Value</Label>
                      <Input
                        id="goal-target"
                        type="number"
                        value={goalForm.targetValue}
                        onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })}
                        placeholder="e.g., 50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-deadline">Deadline (Optional)</Label>
                      <Input
                        id="goal-deadline"
                        type="date"
                        value={goalForm.deadline}
                        onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={createGoalMutation.isPending} className="flex-1">
                        {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateGoal(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={() => router.push('/study-tools')} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back to Study Tools
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <div className="space-y-8">
              {/* Current Goals */}
              <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative z-10 pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Current Goals</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Track your daily and weekly study objectives
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">
                  {/* Daily Goals */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Daily Goals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Cards to Review</span>
                          <Badge variant="secondary">
                            {studyPlanStats?.daily.totalCards || 0}/20
                          </Badge>
                        </div>
                        <Progress value={studyPlanStats ? (studyPlanStats.daily.totalCards / 20) * 100 : 0} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {studyPlanStats?.daily.totalCards || 0} of 20 cards completed
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Study Time</span>
                          <Badge variant="secondary">
                            {studyPlanStats?.daily.totalMinutes || 0}/60 min
                          </Badge>
                        </div>
                        <Progress value={studyPlanStats ? (studyPlanStats.daily.totalMinutes / 60) * 100 : 0} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {studyPlanStats?.daily.totalMinutes || 0} of 60 minutes completed
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Goals */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Weekly Goals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Decks to Master</span>
                          <Badge variant="secondary">
                            0/3
                          </Badge>
                        </div>
                        <Progress value={0} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          0 of 3 decks mastered
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Study Streak</span>
                          <Badge variant="secondary">
                            {studyPlanStats?.weekly.sessionCount || 0}/7 days
                          </Badge>
                        </div>
                        <Progress value={studyPlanStats ? (studyPlanStats.weekly.sessionCount / 7) * 100 : 0} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {studyPlanStats?.weekly.sessionCount || 0} day study streak
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Study Schedule */}
              <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Study Schedule
                  </CardTitle>
                  <CardDescription>
                    Plan your study sessions for the week
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    {dayNames.map((day, index) => {
                      const schedule = studySchedules?.find((s: any) => s.dayOfWeek === index);
                      return (
                        <div key={day} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">{day.charAt(0)}</span>
                            </div>
                            <span className="font-medium">{day}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={schedule?.isActive ? "default" : "secondary"} className="text-xs">
                              {schedule ? `${schedule.startTime.slice(0, 5)} - ${schedule.endTime.slice(0, 5)}` : "No schedule"}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <Button
                  className="w-full gap-2 h-11 justify-start"
                  onClick={() => setShowCreateGoal(true)}
                >
                  <Plus className="w-4 h-4" />
                  New Goal
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 h-11 justify-start"
                  onClick={() => router.push('/study-tools')}
                >
                  <Target className="w-4 h-4" />
                  Study Tools
                </Button>
              </CardContent>
            </Card>

            {/* Study Stats */}
            <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Study Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {studyPlanStats?.weekly.sessionCount || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Sessions this week</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-sm font-medium">{studyPlanStats?.daily.totalMinutes || 0}m</p>
                    <p className="text-xs text-muted-foreground">Today</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-sm font-medium">{studyPlanStats?.daily.totalCards || 0}</p>
                    <p className="text-xs text-muted-foreground">Cards</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motivational Quote */}
            <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Daily Motivation
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    💪
                  </div>
                  <blockquote className="text-sm italic text-muted-foreground">
                    "The beautiful thing about learning is that no one can take it away from you."
                  </blockquote>
                  <cite className="text-xs text-muted-foreground mt-2 block">- B.B. King</cite>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    
  );
}