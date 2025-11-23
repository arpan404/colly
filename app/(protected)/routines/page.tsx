'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc-client';
import { Clock, Plus, Repeat, Calendar, Trash2, RotateCcw, AlertCircle, Eye, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function RoutinesPage() {
  const [showForm, setShowForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
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

  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    isRecurring: true,
  });

  // Error states for form
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [editFormErrors, setEditFormErrors] = useState<{ [key: string]: string }>({});
  // Filters / search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDay, setFilterDay] = useState<'all' | number>('all');
  const [filterRecurring, setFilterRecurring] = useState<'all' | 'yes' | 'no'>('all');
  const [compactView, setCompactView] = useState(false);

  // Helper function to sanitize and parse errors
  const handleFormError = (error: any, setFieldErrors: (errors: { [key: string]: string }) => void) => {
    // Check if it's a 500 internal server error
    if (error?.code === 'INTERNAL_SERVER_ERROR' || error?.status === 500) {
      toast.error('Internal server error. Please try again later.');
      return;
    }

    // Clear previous errors
    setFieldErrors({});

    if (error?.message) {
      // Sanitize error message - remove any sensitive information
      const sanitizedMessage = error.message
        .replace(/password/gi, 'credential')
        .replace(/token/gi, 'session')
        .replace(/secret/gi, 'key')
        .replace(/\b\d{4,}\b/g, '****') // Mask long numbers (potentially sensitive)
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 'user@example.com'); // Mask emails

      // Check if it's a field-specific error (contains field name patterns)
      const fieldPatterns = {
        title: /title/i,
        description: /description/i,
        dayOfWeek: /day|week/i,
        startTime: /start.*time|time.*start/i,
        endTime: /end.*time|time.*end/i,
      };

      let isFieldError = false;
      const fieldErrors: { [key: string]: string } = {};

      for (const [field, pattern] of Object.entries(fieldPatterns)) {
        if (pattern.test(sanitizedMessage)) {
          fieldErrors[field] = sanitizedMessage;
          isFieldError = true;
          break; // Only assign to first matching field
        }
      }

      if (isFieldError) {
        setFieldErrors(fieldErrors);
      } else {
        // General error - show as toast
        toast.error('Operation failed', {
          description: sanitizedMessage,
        });
      }
    } else {
      // Fallback error message
      toast.error('Something went wrong', {
        description: 'Please try again later.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({}); // Clear previous errors

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
      toast.success('Routine created successfully!');
    } catch (err: any) {
      handleFormError(err, setFormErrors);
    }
  };

  const applyCreatePreset = (preset: '30' | '60' | 'morning' | 'evening') => {
    switch (preset) {
      case '30':
        setFormData({ ...formData, startTime: '09:00', endTime: '09:30' });
        break;
      case '60':
        setFormData({ ...formData, startTime: '09:00', endTime: '10:00' });
        break;
      case 'morning':
        setFormData({ ...formData, startTime: '06:00', endTime: '07:00' });
        break;
      case 'evening':
        setFormData({ ...formData, startTime: '18:00', endTime: '19:00' });
        break;
    }
  };

  const applyEditPreset = (preset: '30' | '60' | 'morning' | 'evening') => {
    switch (preset) {
      case '30':
        setEditFormData({ ...editFormData, startTime: '09:00', endTime: '09:30' });
        break;
      case '60':
        setEditFormData({ ...editFormData, startTime: '09:00', endTime: '10:00' });
        break;
      case 'morning':
        setEditFormData({ ...editFormData, startTime: '06:00', endTime: '07:00' });
        break;
      case 'evening':
        setEditFormData({ ...editFormData, startTime: '18:00', endTime: '19:00' });
        break;
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this routine?')) {
      try {
        await deleteMutation.mutateAsync({ id });
        refetch();
        setShowDetailsModal(false);
        toast.success('Routine deleted successfully!');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete routine');
      }
    }
  };

  const handleViewDetails = (routine: any) => {
    setSelectedRoutine(routine);
    setEditFormData({
      title: routine.title,
      description: routine.description || '',
      dayOfWeek: routine.dayOfWeek,
      startTime: routine.startTime,
      endTime: routine.endTime,
      isRecurring: routine.isRecurring,
    });
    setIsEditing(false);
    setEditFormErrors({});
    setShowDetailsModal(true);
  };

  // Keyboard navigation helper for routine blocks (arrow keys)
  const handleRoutineNav = (e: React.KeyboardEvent, dayIndex: number, routine: any) => {
    const key = e.key;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) return;

    e.preventDefault();
    const currStart = routine.startTime;
    const currMinutes = (() => {
      const [h, m] = currStart.split(':').map(Number);
      return h * 60 + m;
    })();

    const all = Array.from(document.querySelectorAll('.routine-block')) as HTMLElement[];

    const routinesInDay = all.filter(el => Number(el.dataset.dayIndex) === dayIndex);

    if (key === 'ArrowUp' || key === 'ArrowDown') {
      // find candidate in same day
      const candidates = routinesInDay.map(el => ({ el, start: Number(el.dataset.startMinutes) })).sort((a, b) => a.start - b.start);
      if (candidates.length === 0) return;
      if (key === 'ArrowUp') {
        const prev = candidates.filter(c => c.start < currMinutes).pop();
        if (prev) prev.el.focus();
      } else {
        const next = candidates.find(c => c.start > currMinutes);
        if (next) next.el.focus();
      }
      return;
    }

    // Left / Right -> move across days
    const direction = key === 'ArrowLeft' ? -1 : 1;
    let targetDay = dayIndex + direction;
    if (targetDay < 0) targetDay = 6;
    if (targetDay > 6) targetDay = 0;

    // Find routines in target day
    const targetRoutines = all.filter(el => Number(el.dataset.dayIndex) === targetDay).map(el => ({ el, start: Number(el.dataset.startMinutes) }));
    if (targetRoutines.length === 0) return;
    // choose the closest start time to current
    let best = targetRoutines[0];
    let bestDiff = Math.abs(best.start - currMinutes);
    for (const candidate of targetRoutines) {
      const diff = Math.abs(candidate.start - currMinutes);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = candidate;
      }
    }
    best.el.focus();
  };

  const handleEditRoutine = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormErrors({});
    setEditFormData({
      title: selectedRoutine.title,
      description: selectedRoutine.description || '',
      dayOfWeek: selectedRoutine.dayOfWeek,
      startTime: selectedRoutine.startTime,
      endTime: selectedRoutine.endTime,
      isRecurring: selectedRoutine.isRecurring,
    });
  };

  const handleUpdateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFormErrors({});

    try {
      await updateMutation.mutateAsync({
        id: selectedRoutine.id,
        ...editFormData,
      });
      setIsEditing(false);
      refetch();
      toast.success('Routine updated successfully!');
    } catch (err: any) {
      handleFormError(err, setEditFormErrors);
    }
  };

  // Apply search & filters, then group routines by day and sort
  const filteredRoutines = (routines || []).filter((routine: any) => {
    const q = searchQuery.trim().toLowerCase();

    // Search title/description
    if (q) {
      const inTitle = routine.title?.toLowerCase().includes(q);
      const inDesc = routine.description?.toLowerCase().includes(q);
      if (!inTitle && !inDesc) return false;
    }

    // Day filter
    if (filterDay !== 'all' && routine.dayOfWeek !== filterDay) return false;

    // Recurring filter
    if (filterRecurring === 'yes' && !routine.isRecurring) return false;
    if (filterRecurring === 'no' && routine.isRecurring) return false;

    return true;
  });

  const routinesByDay = DAYS.map((day, index) => ({
    day,
    dayIndex: index,
    routines: filteredRoutines.filter((routine: any) => routine.dayOfWeek === index).sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
  }));

  return (
    <PageLayout>
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-sm border border-primary/5">
                  <Calendar className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Weekly Routines</h1>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xl">A focused view of your weekly habits — click any routine to view, edit, or remove it.</p>
                </div>
              </div>
            </div>

            <Dialog open={showForm} onOpenChange={(open) => {
              setShowForm(open);
              if (!open) {
                setFormErrors({});
                setFormData({
                  title: '',
                  description: '',
                  dayOfWeek: 1,
                  startTime: '09:00',
                  endTime: '10:00',
                  isRecurring: true,
                });
              }
            }}>
                <DialogTrigger asChild>
                <Button className="gap-2 px-5 py-2.5 shadow-sm hover:shadow-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/40" aria-label="Add routine">
                  <Plus className="w-4 h-4" />
                  Add Routine
                </Button>
              </DialogTrigger>
                  {/* Search & Filters (desktop) */}
                  <div className="hidden sm:flex items-center gap-3 ml-4">
                    <Input
                      placeholder="Search routines..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-52 text-sm"
                      aria-label="Search routines"
                    />
                    <Select value={filterDay.toString()} onValueChange={(v) => setFilterDay(v === 'all' ? 'all' : parseInt(v))}>
                      <SelectTrigger className="h-9 w-36 text-sm border-border/30">
                        <SelectValue placeholder="Any day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any day</SelectItem>
                        {DAYS.map((d, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterRecurring} onValueChange={(v) => setFilterRecurring(v as 'all' | 'yes' | 'no')}>
                      <SelectTrigger className="h-9 w-36 text-sm border-border/30">
                        <SelectValue placeholder="Recurring" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Recurring</SelectItem>
                        <SelectItem value="no">One-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              <DialogContent className="sm:max-w-md border-0 shadow-xl bg-card/95 backdrop-blur-sm">
                <DialogHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/5">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-semibold">Create New Routine</DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Add a new routine to your weekly schedule
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="routine-title" className="text-sm font-medium">Routine Title *</Label>
                    <Input
                      id="routine-title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Morning Workout, Reading Time"
                      required
                      className={`h-11 transition-colors ${formErrors.title ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary/50'}`}
                    />
                    {formErrors.title && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.title}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="routine-description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="routine-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add details about this routine..."
                      rows={2}
                      className={`resize-none transition-colors ${formErrors.description ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary/50'}`}
                    />
                    {formErrors.description && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.description}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="font-medium text-xs">Presets:</div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => applyCreatePreset('30')}>30m</Button>
                      <Button size="sm" variant="ghost" onClick={() => applyCreatePreset('60')}>60m</Button>
                      <Button size="sm" variant="ghost" onClick={() => applyCreatePreset('morning')}>Morning</Button>
                      <Button size="sm" variant="ghost" onClick={() => applyCreatePreset('evening')}>Evening</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Day of Week</Label>
                      <Select value={formData.dayOfWeek.toString()} onValueChange={(value) => setFormData({ ...formData, dayOfWeek: parseInt(value) })}>
                        <SelectTrigger className="h-11 border-border/50 focus:border-primary/50 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((day, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Checkbox
                          checked={formData.isRecurring}
                          onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked as boolean })}
                        />
                        Recurring Weekly
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Start Time</Label>
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                        className={`h-11 transition-colors ${formErrors.startTime ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary/50'}`}
                      />
                      {formErrors.startTime && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.startTime}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">End Time</Label>
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        required
                        className={`h-11 transition-colors ${formErrors.endTime ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary/50'}`}
                      />
                      {formErrors.endTime && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.endTime}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button type="submit" disabled={createMutation.isPending} className="flex-1 h-11 shadow-sm hover:shadow-md transition-all duration-200">
                      {createMutation.isPending ? 'Creating...' : 'Create Routine'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="px-6 border-border/50 hover:bg-muted/50 transition-colors">
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Routine Details Modal */}
          <Dialog open={showDetailsModal} onOpenChange={(open) => {
            setShowDetailsModal(open);
            if (!open) {
              setSelectedRoutine(null);
              setIsEditing(false);
              setEditFormErrors({});
            }
          }}>
            <DialogContent className="sm:max-w-lg border-0 shadow-md bg-card/95 backdrop-blur-sm">
              {selectedRoutine && (
                <>
                  <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/5">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        {!isEditing ? (
                          <div>
                            <DialogTitle className="text-xl font-semibold">{selectedRoutine.title}</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                              {DAYS[selectedRoutine.dayOfWeek]} • {selectedRoutine.startTime} - {selectedRoutine.endTime}
                            </DialogDescription>
                          </div>
                        ) : (
                          <div>
                            <DialogTitle className="text-xl font-semibold">Edit Routine</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                              Update your routine details
                            </DialogDescription>
                          </div>
                        )}
                      </div>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditRoutine}
                          className="gap-2 border-border/50 hover:bg-muted/50 transition-colors"
                          aria-label="Edit routine"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </DialogHeader>

                  {!isEditing ? (
                    <div className="space-y-6 mt-6">
                      {/* Routine Details */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/10 border border-border/30">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/5">
                            <Calendar className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Schedule</div>
                            <div className="text-sm text-muted-foreground">
                              {DAYS[selectedRoutine.dayOfWeek]}, {selectedRoutine.startTime} - {selectedRoutine.endTime}
                            </div>
                          </div>
                        </div>

                        {selectedRoutine.description && (
                          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/10 border border-border/30">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/5 mt-0.5">
                              <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-foreground mb-1">Description</div>
                              <div className="text-sm text-muted-foreground leading-relaxed">
                                {selectedRoutine.description}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/10 border border-border/30">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/5">
                            <Repeat className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Recurring</div>
                            <div className="text-sm text-muted-foreground">
                              {selectedRoutine.isRecurring ? 'Weekly routine' : 'One-time routine'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-border/50">
                        <Button
                          variant="outline"
                          onClick={() => setShowDetailsModal(false)}
                          className="flex-1 border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          Close
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(selectedRoutine.id)}
                          className="gap-2 hover:bg-destructive/90 transition-colors"
                          aria-label="Delete routine"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateRoutine} className="space-y-5 mt-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="font-medium text-xs">Presets:</div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => applyEditPreset('30')}>30m</Button>
                          <Button size="sm" variant="ghost" onClick={() => applyEditPreset('60')}>60m</Button>
                          <Button size="sm" variant="ghost" onClick={() => applyEditPreset('morning')}>Morning</Button>
                          <Button size="sm" variant="ghost" onClick={() => applyEditPreset('evening')}>Evening</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-routine-title" className="text-sm font-medium">Routine Title *</Label>
                        <Input
                          id="edit-routine-title"
                          type="text"
                          value={editFormData.title}
                          onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                          placeholder="e.g., Morning Workout, Reading Time"
                          required
                          className={`h-11 transition-colors ${editFormErrors.title ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary/50'}`}
                        />
                        {editFormErrors.title && (
                          <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="w-4 h-4" />
                            {editFormErrors.title}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-routine-description" className="text-sm font-medium">Description</Label>
                        <Textarea
                          id="edit-routine-description"
                          value={editFormData.description}
                          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                          placeholder="Add details about this routine..."
                          rows={2}
                          className={`resize-none transition-colors ${editFormErrors.description ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary/50'}`}
                        />
                        {editFormErrors.description && (
                          <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="w-4 h-4" />
                            {editFormErrors.description}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Day of Week</Label>
                          <Select value={editFormData.dayOfWeek.toString()} onValueChange={(value) => setEditFormData({ ...editFormData, dayOfWeek: parseInt(value) })}>
                            <SelectTrigger className="h-11 border-border/50 focus:border-primary/50 transition-colors">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS.map((day, idx) => (
                                <SelectItem key={idx} value={idx.toString()}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Checkbox
                              checked={editFormData.isRecurring}
                              onCheckedChange={(checked) => setEditFormData({ ...editFormData, isRecurring: checked as boolean })}
                            />
                            Recurring Weekly
                          </Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Start Time</Label>
                          <Input
                            type="time"
                            value={editFormData.startTime}
                            onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                            required
                            className={`h-11 transition-colors ${editFormErrors.startTime ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary/50'}`}
                          />
                          {editFormErrors.startTime && (
                            <div className="flex items-center gap-2 text-sm text-destructive">
                              <AlertCircle className="w-4 h-4" />
                              {editFormErrors.startTime}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">End Time</Label>
                          <Input
                            type="time"
                            value={editFormData.endTime}
                            onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                            required
                            className={`h-11 transition-colors ${editFormErrors.endTime ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary/50'}`}
                          />
                          {editFormErrors.endTime && (
                            <div className="flex items-center gap-2 text-sm text-destructive">
                              <AlertCircle className="w-4 h-4" />
                              {editFormErrors.endTime}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-6 border-t border-border/50">
                        <Button type="submit" disabled={updateMutation.isPending} className="flex-1 h-11 shadow-sm hover:shadow-md transition-all duration-200">
                          {updateMutation.isPending ? 'Updating...' : 'Update Routine'}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancelEdit} className="px-6 border-border/50 hover:bg-muted/50 transition-colors">
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Weekly Calendar */}
          <Card className={`rounded-2xl border bg-card/60 shadow-sm overflow-visible ${compactView ? 'hidden sm:block' : ''}`}>
            <CardContent className="p-0" role="region" aria-label="Weekly routines calendar">
              <div className="overflow-auto md:overflow-visible">
                <div className="min-w-[980px]">
              {/* Calendar Header */}
              <div className="grid grid-cols-8 border-b border-border/30 bg-muted/20">
                <div className="p-3 border-r border-border/30 bg-muted/10 w-[84px] flex items-center justify-center">
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Time</div>
                </div>
                {DAYS.map((day, index) => (
                  <div key={index} role="columnheader" aria-label={`${day} header`} className={`p-4 border-r border-border/30 last:border-r-0 text-center transition-colors ${index === new Date().getDay() ? 'bg-primary/5 border-primary/10' : 'bg-muted/10'}`}>
                    <div className="text-sm font-semibold text-foreground mb-1">{day.slice(0, 3)}</div>
                    <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    {index === new Date().getDay() && (
                      <Badge variant="secondary" className="mt-2 text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors">
                        Today
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              {/* Mobile view toggle */}
              <div className="flex sm:hidden items-center gap-2 ml-3">
                <Button variant={compactView ? 'secondary' : 'ghost'} size="sm" onClick={() => setCompactView(false)} aria-pressed={!compactView}>
                  Calendar
                </Button>
                <Button variant={compactView ? 'ghost' : 'secondary'} size="sm" onClick={() => setCompactView(true)} aria-pressed={compactView}>
                  List
                </Button>
              </div>

              <div className="relative">
                {/* Time slots */}
                {Array.from({ length: 19 }, (_, i) => {
                  const hour = i + 6; // Start from 6 AM
                  const timeString = `${hour.toString().padStart(2, '0')}:00`;
                  const isHour = hour % 2 === 0; // Alternate background for even hours

                  return (
                    <div key={hour} role="row" aria-label={`Hour ${timeString}`} className={`grid grid-cols-8 border-b border-border/30 last:border-b-0 ${isHour ? 'bg-muted/20' : 'bg-background/50'}`}>
                      <div className="p-4 border-r border-border/50 bg-muted/30 flex items-center justify-center">
                        <div className="text-xs font-medium text-muted-foreground">{timeString}</div>
                      </div>
                      {DAYS.map((day, dayIndex) => {
                        const dayRoutines = routinesByDay.find(d => d.dayIndex === dayIndex)?.routines || [];
                        const slotStart = new Date(`2000-01-01T${timeString}:00`);
                        const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1 hour later

                        const routinesInSlot = dayRoutines.filter((routine: any) => {
                          const routineStart = new Date(`2000-01-01T${routine.startTime}`);
                          const routineEnd = new Date(`2000-01-01T${routine.endTime}`);
                          return routineStart < slotEnd && routineEnd > slotStart;
                        });

                        return (
                          <div key={dayIndex} role="gridcell" aria-label={`${DAYS[dayIndex]} ${timeString} slot`} className="relative min-h-20 border-r border-border/30 last:border-r-0 p-2 transition-colors hover:bg-muted/10">
                            {routinesInSlot.map((routine: any, routineIndex: number) => {
                              const startTime = new Date(`2000-01-01T${routine.startTime}`);
                              const endTime = new Date(`2000-01-01T${routine.endTime}`);
                              const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // minutes

                              // Calculate the visible portion of the routine in this time slot
                              const visibleStart = new Date(Math.max(startTime.getTime(), slotStart.getTime()));
                              const visibleEnd = new Date(Math.min(endTime.getTime(), slotEnd.getTime()));
                              const visibleDuration = (visibleEnd.getTime() - visibleStart.getTime()) / (1000 * 60);
                              const height = Math.max((visibleDuration / 60) * 76, 32); // At least 32px height for partial visibility

                              // Calculate vertical offset for routines that start before this slot
                              const minutesFromSlotStart = (visibleStart.getTime() - slotStart.getTime()) / (1000 * 60);
                              const topOffset = (minutesFromSlotStart / 60) * 76;

                              // Calculate overlap and positioning
                              const overlappingRoutines = routinesInSlot.filter((r: any) => {
                                const rStart = new Date(`2000-01-01T${r.startTime}`);
                                const rEnd = new Date(`2000-01-01T${r.endTime}`);
                                return visibleStart < rEnd && visibleEnd > rStart;
                              });

                              const overlapCount = overlappingRoutines.length;
                              const routinePosition = overlappingRoutines.findIndex((r: any) => r.id === routine.id);
                              const width = overlapCount > 1 ? `calc(${100 / overlapCount}% - 4px)` : 'calc(100% - 16px)';
                              const left = overlapCount > 1 ? `calc(${routinePosition * (100 / overlapCount)}% + 8px)` : '8px';

                              return (
                                <div
                                  key={routine.id}
                                  className="absolute routine-block bg-primary/10 border border-primary/10 rounded-xl p-2 cursor-pointer hover:bg-primary/15 hover:border-primary/20 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                  style={{
                                    height: `${height}px`,
                                    left: left,
                                    width: width,
                                    top: `${topOffset}px`,
                                    zIndex: routineIndex + 1
                                  }}
                                  title={`${routine.title} — ${routine.startTime}–${routine.endTime}`}
                                  tabIndex={0}
                                  data-day-index={dayIndex}
                                  data-start-minutes={(() => { const [h, m] = routine.startTime.split(':').map(Number); return h * 60 + m; })()}
                                  onClick={() => handleViewDetails(routine)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleViewDetails(routine);
                                      return;
                                    }
                                    handleRoutineNav(e, dayIndex, routine);
                                  }}
                                >
                                  <div className="flex items-center justify-between h-full">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-semibold text-primary truncate leading-tight">
                                        {routine.title}
                                      </div>
                                      {routine.description && overlapCount === 1 && (
                                        <div className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                                          {routine.description}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 ml-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewDetails(routine);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 h-5 w-5 p-0 text-primary hover:text-primary hover:bg-primary/10 transition-opacity duration-200 rounded-md"
                                        title="View Details"
                                        aria-label={`View details for ${routine.title}`}
                                      >
                                        <Eye className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  {routine.isRecurring && overlapCount === 1 && (
                                    <div className="absolute bottom-1 right-1">
                                      <Badge variant="outline" className="text-xs px-1 py-0 border-primary/30 text-primary/80 bg-primary/5">
                                        <Repeat className="w-2 h-2 mr-0.5" />
                                        Weekly
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile / Compact list view: show per-day lists */}
          <Card className="sm:hidden mt-4 border bg-card/60 shadow-sm">
            <CardContent>
              {routinesByDay.map((d) => (
                <div key={d.dayIndex} className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold">{d.day}</div>
                    <div className="text-xs text-muted-foreground">{d.routines.length} item{d.routines.length !== 1 ? 's' : ''}</div>
                  </div>

                  {d.routines.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-3 border border-border/30 rounded-lg bg-muted/5">No routines</div>
                  ) : (
                    <div className="space-y-2">
                      {d.routines.map((routine: any) => (
                        <div key={routine.id} className="p-3 rounded-lg border border-border/30 bg-muted/10 cursor-pointer hover:bg-muted/20 transition-colors flex items-center justify-between" onClick={() => handleViewDetails(routine)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleViewDetails(routine); } }}>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">{routine.title}</div>
                            <div className="text-xs text-muted-foreground">{routine.startTime} - {routine.endTime}</div>
                          </div>
                          <div className="ml-2 flex items-center gap-2 text-xs">
                            {routine.isRecurring && <Badge variant="outline" className="px-2 py-0.5">Weekly</Badge>}
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(routine); }} aria-label={`Open ${routine.title}`}>Open</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Summary Stats */}
          {routines && routines.length > 0 && (
            <Card className="mt-10 rounded-2xl border bg-card/60 shadow-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shadow-sm border border-primary/5">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-semibold">Weekly Summary</CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">
                      Overview of your routine schedule and progress
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 rounded-lg bg-muted/10 border border-border/30 hover:bg-muted/20 transition-colors">
                    <div className="text-3xl font-extrabold text-primary mb-2">{routines.length}</div>
                    <div className="text-sm text-muted-foreground font-medium">Total Routines</div>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-muted/10 border border-border/30 hover:bg-muted/20 transition-colors">
                    <div className="text-3xl font-extrabold text-green-600 mb-2">
                      {routines.filter((r: any) => r.isRecurring).length}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Recurring</div>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-muted/10 border border-border/30 hover:bg-muted/20 transition-colors">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {new Set(routines.map((r: any) => r.dayOfWeek)).size}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Active Days</div>
                  </div>
                  <div className="text-center p-6 rounded-lg bg-muted/10 border border-border/30 hover:bg-muted/20 transition-colors">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {Math.round(routines.reduce((acc: number, r: any) => {
                        const start = new Date(`2000-01-01T${r.startTime}`);
                        const end = new Date(`2000-01-01T${r.endTime}`);
                        return acc + (end.getTime() - start.getTime()) / (1000 * 60);
                      }, 0) / 60)}h
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Weekly Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

