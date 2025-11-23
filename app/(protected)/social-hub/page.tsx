"use client";

import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, MapPin, Calendar, Bell, Plus, Search, Filter, Globe, Clock, Star } from "lucide-react";
import { trpc } from '@/lib/trpc-client';
import { format } from 'date-fns';
import { useState } from 'react';

const SocialHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const { data: events, isLoading } = trpc.events.get.useQuery({ includePublic: true });

  const mockEvents = [
    {
      id: "1",
      title: "Tech Conference 2025",
      location: "Downtown Convention Center",
      date: "Nov 15, 2025",
      time: "9:00 AM",
      category: "Technology",
      attendees: 150,
      isPublic: true,
      description: "Join us for the biggest tech conference of the year featuring industry leaders and innovative workshops.",
      color: "border-blue-500",
    },
    {
      id: "2",
      title: "Community Meetup",
      location: "Central Park Pavilion",
      date: "Nov 18, 2025",
      time: "6:00 PM",
      category: "Social",
      attendees: 45,
      isPublic: true,
      description: "A casual meetup for locals to connect, share ideas, and build community relationships.",
      color: "border-green-500",
    },
    {
      id: "3",
      title: "Art Exhibition Opening",
      location: "City Art Gallery",
      date: "Nov 20, 2025",
      time: "7:00 PM",
      category: "Arts",
      attendees: 75,
      isPublic: true,
      description: "Opening night reception for our new contemporary art exhibition featuring local artists.",
      color: "border-purple-500",
    },
    {
      id: "4",
      title: "Startup Pitch Night",
      location: "Innovation Hub",
      date: "Nov 22, 2025",
      time: "8:00 PM",
      category: "Business",
      attendees: 60,
      isPublic: true,
      description: "Watch emerging startups pitch their ideas to investors and industry experts.",
      color: "border-orange-500",
    },
  ];

  // Use real events data if available, otherwise fall back to mock data
  const displayEvents = events && events.length > 0 ? events.map((event: any) => ({
    id: event.id,
    title: event.title,
    location: event.location || "TBD",
    date: format(new Date(event.startDate), 'MMM d, yyyy'),
    time: event.startTime ? format(new Date(`2000-01-01T${event.startTime}`), 'h:mm a') : 'TBD',
    category: event.category || 'General',
    attendees: Math.floor(Math.random() * 100) + 10, // Mock attendee count
    isPublic: event.isPublic,
    description: event.description || 'No description available.',
    color: "border-primary",
  })) : mockEvents;

  const filteredEvents = displayEvents.filter((event: any) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || event.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories: string[] = ['all', ...Array.from(new Set(displayEvents.map((event: any) => event.category))) as string[]];

  return (
    <PageLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Social Hub</h1>
            </div>
            <p className="text-muted-foreground">Discover and connect with events in your community</p>
          </div>

          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events, locations, or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-48">
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
                </div>
              </CardContent>
            </Card>

            {/* Events Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading events...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map((event: any) => (
                  <Card key={event.id} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                    <div className={`h-2 ${event.color.replace('border-', 'bg-')}`}></div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{event.title}</CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary">{event.category}</Badge>
                            {event.isPublic && (
                              <Badge variant="outline" className="gap-1">
                                <Globe className="w-3 h-3" />
                                Public
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{event.date} at {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{event.attendees} attending</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                          <Bell className="w-4 h-4" />
                          Notify Me
                        </Button>
                        <Button size="sm" className="flex-1 gap-2">
                          <Calendar className="w-4 h-4" />
                          Add to Calendar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredEvents.length === 0 && !isLoading && (
              <Card className="shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">No events found</h3>
                  <p className="text-muted-foreground text-center">
                    Try adjusting your search or filter criteria
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{filteredEvents.length}</div>
                  <div className="text-sm text-muted-foreground">Events Available</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold text-green-600">
                      {filteredEvents.filter((e: any) => e.category === 'Technology').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Tech Events</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-blue-600">
                      {filteredEvents.filter((e: any) => e.category === 'Social').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Social Events</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredEvents.slice(0, 3).map((event: any) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                      <div className={`w-3 h-3 rounded-full mt-1 ${event.color.replace('border-', 'bg-')}`}></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  ))}
                  {filteredEvents.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.filter(cat => cat !== 'all').map((category) => {
                    const count = filteredEvents.filter((e: any) => e.category === category).length;
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm">{category}</span>
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SocialHub;