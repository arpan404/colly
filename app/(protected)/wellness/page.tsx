'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc-client';
import { format } from 'date-fns';
import { Heart, Droplets, Moon, Plus, TrendingUp, Calendar, Star, Activity, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleFormError = (error: any) => {
    // Check if it's a 500 internal server error
    if (error?.code === 'INTERNAL_SERVER_ERROR' || error?.status === 500) {
      toast.error('Internal server error. Please try again later.');
      return;
    }

    const errorMessage = error?.message || 'An unexpected error occurred';
    
    // Sanitize error message to remove sensitive information
    const sanitizedMessage = errorMessage.replace(/password|token|key/gi, '[REDACTED]');
    
    // Check for field-specific errors
    if (sanitizedMessage.includes('date') || sanitizedMessage.includes('Date')) {
      setFormErrors({ date: sanitizedMessage });
    } else if (sanitizedMessage.includes('mood') || sanitizedMessage.includes('Mood')) {
      setFormErrors({ mood: sanitizedMessage });
    } else if (sanitizedMessage.includes('sleep') || sanitizedMessage.includes('Sleep')) {
      setFormErrors({ sleepHours: sanitizedMessage });
    } else if (sanitizedMessage.includes('water') || sanitizedMessage.includes('Water')) {
      setFormErrors({ waterGlasses: sanitizedMessage });
    } else if (sanitizedMessage.includes('notes') || sanitizedMessage.includes('Notes')) {
      setFormErrors({ notes: sanitizedMessage });
    } else {
      // General error - show toast
      toast.error(sanitizedMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
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
      toast.success('Wellness entry logged successfully!');
    } catch (err) {
      handleFormError(err);
    }
  };

  // Calculate wellness metrics
  const recentLogs = logs?.slice(0, 7) || [];
  const avgMood = recentLogs.length > 0 ? recentLogs.reduce((sum: number, log: any) => sum + (log.mood || 0), 0) / recentLogs.length : 0;
  const avgSleep = recentLogs.length > 0 ? recentLogs.reduce((sum: number, log: any) => sum + Number(log.sleepHours || 0), 0) / recentLogs.length : 0;
  const avgWater = recentLogs.length > 0 ? recentLogs.reduce((sum: number, log: any) => sum + (log.waterGlasses || 0), 0) / recentLogs.length : 0;

  const getMoodEmoji = (mood: number) => {
    if (mood >= 4.5) return '😊';
    if (mood >= 3.5) return '🙂';
    if (mood >= 2.5) return '😐';
    if (mood >= 1.5) return '😕';
    return '😢';
  };

  const getMoodColor = (mood: number) => {
    // neutral in light mode, colored in dark mode
    if (mood >= 4) return 'text-muted-foreground dark:text-green-600';
    if (mood >= 3) return 'text-muted-foreground dark:text-yellow-600';
    if (mood >= 2) return 'text-muted-foreground dark:text-orange-600';
    return 'text-muted-foreground dark:text-red-600';
  };

  return (
    
      <div className="min-h-screen bg-linear-to-br from-background via-background/95 to-background/90">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted/10 dark:bg-linear-to-br dark:from-primary/20 dark:to-primary/10 rounded-2xl flex items-center justify-center shadow-lg border border-border/30 dark:border-primary/20">
                  <Heart className="w-6 h-6 text-muted-foreground dark:text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Wellness Tracker
                  </h1>
                  <p className="text-lg text-muted-foreground">Monitor your mood, sleep, and hydration habits</p>
                </div>
              </div>
            </div>

            <Dialog open={showForm} onOpenChange={(open) => {
              setShowForm(open);
              if (!open) {
                setFormErrors({});
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2 h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                  <Plus className="w-5 h-5" />
                  Log Wellness
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md border-0 shadow-xl bg-card/95 backdrop-blur-sm">
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-muted/10 dark:bg-primary/10 rounded-xl flex items-center justify-center border border-border/30 dark:border-primary/5">
                    <Activity className="w-5 h-5 text-muted-foreground dark:text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">Log Wellness Entry</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">Record your daily wellness metrics and notes.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-3 text-lg font-semibold">
                    <div className="w-8 h-8 bg-muted/10 dark:bg-primary/10 rounded-lg flex items-center justify-center border border-border/30 dark:border-primary/5">
                      <Calendar className="w-4 h-4 text-muted-foreground dark:text-primary" />
                    </div>
                    Date
                  </Label>
                  <div className="relative">
                    <Input
                      id="wellness-date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className={`h-11 text-sm transition-colors ${formErrors.date ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary/50'}`}
                    />
                    {formErrors.date && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-destructive" />
                    )}
                  </div>
                  {formErrors.date && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.date}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center gap-3 text-lg font-semibold">
                    <div className="w-8 h-8 bg-muted/10 dark:bg-primary/10 rounded-lg flex items-center justify-center border border-border/30 dark:border-primary/5">
                      <Star className="w-4 h-4 text-muted-foreground dark:text-primary" />
                    </div>
                    Mood Rating
                  </Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, mood: rating })}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 hover:scale-110 ${
                          formData.mood === rating
                            ? 'border-primary bg-primary/10 shadow-lg'
                            : 'border-border hover:border-primary/50 bg-card/50'
                        }`}
                      >
                        <div className="text-2xl mb-1">{getMoodEmoji(rating)}</div>
                        <div className="text-xs font-medium">{rating}</div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Poor</span>
                    <span>Great</span>
                  </div>
                  {formErrors.mood && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.mood}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-3 text-lg font-semibold">
                      <div className="w-8 h-8 bg-muted/10 dark:bg-primary/10 rounded-lg flex items-center justify-center border border-border/30 dark:border-primary/5">
                        <Moon className="w-4 h-4 text-muted-foreground dark:text-primary" />
                      </div>
                      Sleep Hours
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={formData.sleepHours}
                        onChange={(e) => setFormData({ ...formData, sleepHours: parseFloat(e.target.value) })}
                        placeholder="8.0"
                        className={`h-11 text-sm transition-colors ${formErrors.sleepHours ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary/50'}`}
                      />
                      {formErrors.sleepHours && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-destructive" />
                      )}
                    </div>
                    {formErrors.sleepHours && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.sleepHours}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-3 text-lg font-semibold">
                      <div className="w-8 h-8 bg-muted/10 dark:bg-primary/10 rounded-lg flex items-center justify-center border border-border/30 dark:border-primary/5">
                        <Droplets className="w-4 h-4 text-muted-foreground dark:text-primary" />
                      </div>
                      Water Glasses
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        value={formData.waterGlasses}
                        onChange={(e) => setFormData({ ...formData, waterGlasses: parseInt(e.target.value) })}
                        placeholder="8"
                        className={`h-11 text-sm transition-colors ${formErrors.waterGlasses ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary/50'}`}
                      />
                      {formErrors.waterGlasses && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-destructive" />
                      )}
                    </div>
                    {formErrors.waterGlasses && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.waterGlasses}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="wellness-notes" className="flex items-center gap-3 text-lg font-semibold">
                    <div className="w-8 h-8 bg-muted/10 dark:bg-primary/10 rounded-lg flex items-center justify-center border border-border/30 dark:border-primary/5">
                      <Activity className="w-4 h-4 text-muted-foreground dark:text-primary" />
                    </div>
                    Notes
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="wellness-notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="How are you feeling today? Any observations..."
                      rows={4}
                      className={`text-sm resize-none transition-colors ${formErrors.notes ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary/50'}`}
                    />
                    {formErrors.notes && (
                      <AlertCircle className="absolute right-3 top-3 w-4 h-4 text-destructive" />
                    )}
                  </div>
                  {formErrors.notes && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-6">
                  <Button type="submit" disabled={createMutation.isPending} className="flex-1 h-11 shadow-sm hover:shadow-md transition-all duration-200">
                    {createMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Logging...
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 mr-2" />
                        Log Entry
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="h-11 px-6 border-border/50 hover:bg-muted/50 transition-colors duration-200">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Cards */}
        {logs && logs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="group relative overflow-hidden border-0 shadow-xl bg-card/50 dark:bg-linear-to-br dark:from-yellow-950/50 dark:to-yellow-900/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-linear-to-br from-transparent dark:from-yellow-500/5 via-transparent to-transparent dark:to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                <CardTitle className="text-lg font-semibold text-foreground/90 dark:text-yellow-300">Average Mood</CardTitle>
                <div className="w-10 h-10 bg-muted/10 dark:bg-linear-to-br dark:from-yellow-500/20 dark:to-yellow-500/10 rounded-xl flex items-center justify-center">
                  <Star className="h-5 w-5 text-muted-foreground dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-foreground dark:text-yellow-400 flex items-center gap-2 mb-2">
                  {getMoodEmoji(avgMood)}
                  {avgMood.toFixed(1)}
                </div>
                <p className="text-gray-100 text-sm dark:text-muted-foreground">
                  Last 7 days average
                </p>
              </CardContent>
            </Card>
            <Card className="group relative overflow-hidden border-0 shadow-xl bg-card/50 dark:bg-linear-to-br dark:from-blue-950/50 dark:to-blue-900/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-linear-to-br from-transparent dark:from-blue-500/5 via-transparent to-transparent dark:to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                <CardTitle className="text-lg font-semibold text-foreground/90 dark:text-blue-300">Average Sleep</CardTitle>
                <div className="w-10 h-10 bg-muted/10 dark:bg-linear-to-br dark:from-blue-500/20 dark:to-blue-500/10 rounded-xl flex items-center justify-center">
                  <Moon className="h-5 w-5 text-muted-foreground dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-foreground dark:text-blue-400">{avgSleep.toFixed(1)}h</div>
                <p className="text-sm text-muted-foreground">
                  Recommended: 7-9 hours
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-xl bg-card/50 dark:bg-linear-to-br dark:from-cyan-950/50 dark:to-cyan-900/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-linear-to-br from-transparent dark:from-cyan-500/5 via-transparent to-transparent dark:to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                <CardTitle className="text-lg font-semibold text-foreground/90 dark:text-cyan-300">Average Hydration</CardTitle>
                <div className="w-10 h-10 bg-muted/10 dark:bg-linear-to-br dark:from-cyan-500/20 dark:to-cyan-500/10 rounded-xl flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-muted-foreground dark:text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-foreground dark:text-cyan-400">{avgWater.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground">
                  Glasses per day
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Wellness Logs */}
        <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <div className="absolute inset-0 bg-linear-to-br from-transparent dark:from-primary/5 via-transparent to-transparent dark:to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-muted/10 dark:bg-linear-to-br dark:from-primary/20 dark:to-primary/10 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-muted-foreground dark:text-primary" />
              </div>
              <CardTitle className="text-2xl">Wellness History</CardTitle>
            </div>
            <CardDescription className="text-base">
              Your recent wellness entries and progress
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            {logs && logs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {logs.map((log: any) => (
                  <Card key={log.id} className="group/item relative overflow-hidden border-0 shadow-lg bg-linear-to-br from-card/80 to-card/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-linear-to-br from-transparent dark:from-primary/3 via-transparent to-transparent dark:to-primary/3 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="pb-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">
                          {format(new Date(log.date), 'MMM d, yyyy')}
                        </CardTitle>
                        {log.date === format(new Date(), 'yyyy-MM-dd') && (
                          <Badge className="bg-muted/10 text-muted-foreground border-border/30 hover:bg-muted/20 transition-colors duration-200 dark:bg-primary/20 dark:text-primary dark:border-primary/30 dark:hover:bg-primary/30">Today</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                      {log.mood && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-muted/10 dark:bg-linear-to-br dark:from-yellow-500/20 dark:to-yellow-500/10 rounded-lg flex items-center justify-center">
                                <Star className="w-4 h-4 text-muted-foreground dark:text-yellow-500" />
                              </div>
                              Mood
                            </span>
                            <span className={`font-semibold ${getMoodColor(log.mood)}`}>
                              {getMoodEmoji(log.mood)} {log.mood}/5
                            </span>
                          </div>
                          <Progress value={(log.mood / 5) * 100} className="h-2" />
                        </div>
                      )}

                      {log.sleepHours && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-muted/10 dark:bg-linear-to-br dark:from-blue-500/20 dark:to-blue-500/10 rounded-lg flex items-center justify-center">
                              <Moon className="w-4 h-4 text-muted-foreground dark:text-blue-500" />
                            </div>
                            Sleep
                          </span>
                          <span className="font-semibold">{Number(log.sleepHours)}h</span>
                        </div>
                      )}

                      {log.waterGlasses && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-muted/10 dark:bg-linear-to-br dark:from-cyan-500/20 dark:to-cyan-500/10 rounded-lg flex items-center justify-center">
                              <Droplets className="w-4 h-4 text-muted-foreground dark:text-cyan-500" />
                            </div>
                            Water
                          </span>
                          <span className="font-semibold">{log.waterGlasses} glasses</span>
                        </div>
                      )}

                      {log.notes && (
                        <div className="pt-3 border-t border-border/50">
                          <p className="text-sm text-muted-foreground italic">"{log.notes}"</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-linear-to-br from-muted/20 to-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold text-muted-foreground mb-3">No wellness logs yet</h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Start tracking your wellness journey by logging your first entry
                </p>
                <Button onClick={() => setShowForm(true)} className="gap-2 h-12 px-8 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                  <Plus className="w-5 h-5" />
                  Log Your First Entry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    
  );
}

