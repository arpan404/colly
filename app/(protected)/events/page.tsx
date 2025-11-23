'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc-client';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Plus, Users, Trash2, CalendarDays, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function EventsPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: events, refetch } = trpc.events.get.useQuery({ includePublic: true });
  const createMutation = trpc.events.create.useMutation();
  const updateMutation = trpc.events.update.useMutation();
  const deleteMutation = trpc.events.delete.useMutation();

  // Delete dialog state
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

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

  // Error states for form
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

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
        startDate: /start.*date|date.*start/i,
        startTime: /start.*time|time.*start/i,
        endDate: /end.*date|date.*end/i,
        endTime: /end.*time|time.*end/i,
        location: /location/i,
        category: /categor/i,
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
      toast.success('Event created successfully!');
    } catch (err: any) {
      handleFormError(err, setFormErrors);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteEventId(id);
  };

  const confirmDelete = async () => {
    if (!deleteEventId) return;

    try {
      await deleteMutation.mutateAsync({ id: deleteEventId });
      refetch();
      setDeleteEventId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Group events by date
  const groupedEvents = events?.reduce((groups: any, event: any) => {
    const date = format(new Date(event.startDate), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {}) || {};

  const sortedDates = Object.keys(groupedEvents).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <PageLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Events</h1>
            </div>
            <p className="text-muted-foreground">Organize and manage your schedule with events</p>
          </div>

          <Dialog open={showForm} onOpenChange={(open) => {
            setShowForm(open);
            if (!open) {
              setFormErrors({});
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
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  Create New Event
                </DialogTitle>
                <DialogDescription>
                  Add a new event to your calendar. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="event-title">Event Title *</Label>
                  <Input
                    id="event-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter event title"
                    required
                    className={formErrors.title ? 'border-destructive focus:border-destructive' : ''}
                  />
                  {formErrors.title && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.title}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add event details..."
                    rows={3}
                    className={formErrors.description ? 'border-destructive focus:border-destructive' : ''}
                  />
                  {formErrors.description && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.description}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date *</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className={formErrors.startDate ? 'border-destructive focus:border-destructive' : ''}
                    />
                    {formErrors.startDate && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.startDate}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className={formErrors.startTime ? 'border-destructive focus:border-destructive' : ''}
                    />
                    {formErrors.startTime && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.startTime}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={formErrors.endDate ? 'border-destructive focus:border-destructive' : ''}
                    />
                    {formErrors.endDate && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.endDate}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className={formErrors.endTime ? 'border-destructive focus:border-destructive' : ''}
                    />
                    {formErrors.endTime && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.endTime}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Where is the event?"
                        className={`pl-10 ${formErrors.location ? 'border-destructive focus:border-destructive' : ''}`}
                      />
                    </div>
                    {formErrors.location && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.location}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Work, Personal, Social"
                      className={formErrors.category ? 'border-destructive focus:border-destructive' : ''}
                    />
                    {formErrors.category && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.category}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-public"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked as boolean })}
                  />
                  <Label htmlFor="is-public" className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" />
                    Make this event public
                  </Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                    {createMutation.isPending ? 'Creating...' : 'Create Event'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events List */}
        <div className="space-y-8">
          {sortedDates.length > 0 ? (
            sortedDates.map((date) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {groupedEvents[date].length} event{groupedEvents[date].length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {groupedEvents[date].map((event: any) => (
                    <Card key={event.id} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-1">{event.title}</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                              {event.isPublic && (
                                <Badge variant="secondary" className="gap-1">
                                  <Users className="w-3 h-3" />
                                  Public
                                </Badge>
                              )}
                              {event.category && (
                                <Badge variant="outline">{event.category}</Badge>
                              )}
                            </div>
                          </div>
                          <AlertDialog open={deleteEventId === event.id} onOpenChange={(open) => !open && setDeleteEventId(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                                onClick={() => setDeleteEventId(event.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{event.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={confirmDelete}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Event
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              {event.startTime ? format(new Date(`${event.startDate}T${event.startTime}`), 'h:mm a') : 'All day'}
                              {event.endTime && ` - ${format(new Date(`${event.endDate || event.startDate}T${event.endTime}`), 'h:mm a')}`}
                            </span>
                          </div>

                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <Card className="shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <CalendarDays className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">No events yet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Create your first event to start organizing your schedule
                </p>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

