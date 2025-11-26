"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, dateFnsLocalizer, SlotInfo, ToolbarProps, Event, DateHeaderProps } from 'react-big-calendar';
import { format as dateFormat, parse, startOfWeek, getDay, isSameDay, parseISO, format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './big-calendar.css';
import { Users, MapPin, Calendar as CalendarIcon, Bell, Plus, Search, Filter, Globe, Clock, Star, Edit, Trash2 } from "lucide-react";
import { trpc } from '@/lib/trpc-client';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const availableCategories = [
  'Technology',
  'Social',
  'Arts',
  'Business',
  'Sports',
  'Education',
  'Health',
  'Entertainment',
  'Travel',
  'Food'
];

const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  isPublic: z.boolean().default(false),
});

type CreateEventForm = z.infer<typeof createEventSchema>;

const localizer = dateFnsLocalizer({
  format: dateFormat,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

const SocialHub = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data: events, isLoading, refetch } = trpc.events.get.useQuery({ includePublic: true });
  const createEventMutation = trpc.events.create.useMutation();
  const updateEventMutation = trpc.events.update.useMutation();
  const deleteEventMutation = trpc.events.delete.useMutation();

  const form = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      category: '',
      isPublic: false,
    },
  });

  const bigCalendarEvents = useMemo(() => {
    if (!events) return [];
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startTime ? new Date(`${event.startDate}T${event.startTime}`) : new Date(event.startDate),
      end: event.endTime ? new Date(`${event.endDate || event.startDate}T${event.endTime}`) : new Date(event.endDate || event.startDate),
      resource: event,
    }));
  }, [events]);

  // Map events to date keys (yyyy-MM-dd) so month cells can show colored dots
  const eventsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    if (!bigCalendarEvents) return map;
    bigCalendarEvents.forEach((ev) => {
      try {
        const key = format(ev.start, 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(ev);
      } catch (e) {
        // ignore invalid dates
      }
    });
    return map;
  }, [bigCalendarEvents]);

  const getColorForCategory = (category?: string) => {
    if (!category) return 'hsl(var(--primary))';
    
    // Generate a more varied color palette using string hash
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use different hue ranges for more variety
    const hue = Math.abs(hash) % 360;
    const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
    const lightness = 45 + (Math.abs(hash >> 8) % 20); // 45-65%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const eventsForSelectedDate = useMemo(() => {
    if (!events || !selectedDate) return [];
    return events.filter(event => isSameDay(parseISO(event.startDate), selectedDate));
  }, [events, selectedDate]);

  const handleCreateEvent = async (data: CreateEventForm) => {
    try {
      await createEventMutation.mutateAsync(data);
      toast.success('Event created successfully!');
      setCreateDialogOpen(false);
      form.reset();
      refetch();
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventMutation.mutateAsync({ id: eventId });
      toast.success('Event deleted successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const filteredEventsForDate = useMemo(() => {
    let filtered = eventsForSelectedDate;
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterCategory !== 'all') {
      filtered = filtered.filter(event => event.category === filterCategory);
    }
    return filtered;
  }, [eventsForSelectedDate, searchQuery, filterCategory]);

  // categories for the select - use available categories
  const categories = useMemo(() => {
    return ['all', ...availableCategories];
  }, []);

  // upcoming events (optionally filtered by search/category)
  const filteredUpcomingEvents = useMemo(() => {
    if (!events) return [];
    const today = new Date();
    let upcoming = events.filter(e => {
      try {
        return parseISO(e.startDate) >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
      } catch (err) {
        return false;
      }
    });
    if (searchQuery) {
      upcoming = upcoming.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterCategory !== 'all') {
      upcoming = upcoming.filter(event => event.category === filterCategory);
    }
    // sort by start date ascending
    upcoming.sort((a, b) => {
      try {
        return parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime();
      } catch (e) {
        return 0;
      }
    });
    return upcoming;
  }, [events, searchQuery, filterCategory]);
  

  return (
    
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Social Hub</h1>
            </div>
            <p className="text-muted-foreground">Discover and manage your events</p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Add a new event to your calendar. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateEvent)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Event title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Event description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Event location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getColorForCategory(category) }}
                                  />
                                  {category}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Make this event public</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createEventMutation.isPending}>
                      {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Event Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getColorForCategory(selectedEvent?.category || undefined) }}
                />
                {selectedEvent?.title}
              </DialogTitle>
              <DialogDescription>
                Event details and information
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                {selectedEvent.description && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Start Date</h4>
                    <p className="text-sm">{format(parseISO(selectedEvent.startDate), 'MMM d, yyyy')}</p>
                  </div>
                  {selectedEvent.endDate && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">End Date</h4>
                      <p className="text-sm">{format(parseISO(selectedEvent.endDate), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {selectedEvent.startTime && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Start Time</h4>
                      <p className="text-sm">{format(parseISO(`2000-01-01T${selectedEvent.startTime}`), 'h:mm a')}</p>
                    </div>
                  )}
                  {selectedEvent.endTime && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">End Time</h4>
                      <p className="text-sm">{format(parseISO(`2000-01-01T${selectedEvent.endTime}`), 'h:mm a')}</p>
                    </div>
                  )}
                </div>
                {selectedEvent.location && (
                  <div>
                    <h4 className="font-medium text-sm mb-1 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Location
                    </h4>
                    <p className="text-sm">{selectedEvent.location}</p>
                  </div>
                )}
                {selectedEvent.category && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Category</h4>
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: `${getColorForCategory(selectedEvent.category)}30`,
                        color: getColorForCategory(selectedEvent.category),
                      }}
                    >
                      {selectedEvent.category}
                    </Badge>
                  </div>
                )}
                {selectedEvent.isPublic && (
                  <div>
                    <Badge variant="outline" className="text-xs">
                      <Globe className="w-3 h-3 mr-1" />
                      Public Event
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Calendar */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <Calendar
                    localizer={localizer}
                    events={bigCalendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    views={['month']}
                    defaultView="month"
                    onSelectSlot={(slotInfo: SlotInfo) => setSelectedDate(slotInfo.start)}
                    selectable
                    popup
                    components={{
                      toolbar: ({ label, onNavigate, onView }: any) => (
                        <div className="flex justify-between items-center p-4 bg-background border-b">
                          <button onClick={() => onNavigate('PREV')} className="p-2 hover:bg-muted rounded-md transition-colors">
                            ‹
                          </button>
                          <h2 className="text-lg font-semibold text-foreground">{label}</h2>
                          <button onClick={() => onNavigate('NEXT')} className="p-2 hover:bg-muted rounded-md transition-colors">
                            ›
                          </button>
                        </div>
                      ),
                      month: {
                        dateHeader: ({ date, label }: any) => {
                          const key = format(date, 'yyyy-MM-dd');
                          const evs = eventsByDate[key] || [];
                          return (
                            <div className="flex flex-col items-center py-2">
                              <div className="text-center text-sm font-medium text-foreground">{label}</div>
                              {evs.length > 0 && (
                                <div className="rbc-date-dots mt-1">
                                  {evs.slice(0, 4).map((e: any, idx: number) => {
                                    const dotColor = getColorForCategory(e.resource?.category);
                                    return (
                                      <span
                                        key={e.id + '-' + idx}
                                        className="rbc-date-dot"
                                        style={{ backgroundColor: dotColor }}
                                        title={e.title}
                                      />
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        },
                      },
                      // hide event labels in month cells; we show dots instead
                      event: () => null,
                    }}
                    eventPropGetter={(event: any) => ({
                      style: {
                        display: 'none',
                      },
                    })}
                    dayPropGetter={() => ({ style: {} })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Today's Events */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {selectedDate ? format(selectedDate, 'MMM d') : 'Today'}'s Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredEventsForDate.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No events on this date</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredEventsForDate.slice(0, 10).map((event) => (
                      <div
                        key={event.id}
                        className="group flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 hover:shadow-sm transition-all duration-200"
                        onClick={() => {
                          setSelectedEvent(event);
                          setDetailDialogOpen(true);
                        }}
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: getColorForCategory(event.category || undefined) }}
                        />
                        <h4 className="font-medium text-sm truncate flex-1">
                          {event.title}
                        </h4>
                        {event.startTime && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {format(parseISO(`2000-01-01T${event.startTime}`), 'h:mm a')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredUpcomingEvents.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredUpcomingEvents.slice(0, 10).map((event) => (
                      <div
                        key={event.id}
                        className="group flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 hover:shadow-sm transition-all duration-200"
                        onClick={() => {
                          setSelectedEvent(event);
                          setDetailDialogOpen(true);
                        }}
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: getColorForCategory(event.category || undefined) }}
                        />
                        <h4 className="font-medium text-sm truncate flex-1">
                          {event.title}
                        </h4>
                        <div className="text-xs text-muted-foreground shrink-0">
                          {format(parseISO(event.startDate), 'MMM d')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    
  );
};

export default SocialHub;