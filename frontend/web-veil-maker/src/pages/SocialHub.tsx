import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Calendar, Bell, Plus } from "lucide-react";

const SocialHub = () => {
  const events = [
    {
      id: 1,
      title: "Tech Conference 2025",
      location: "Downtown Convention Center",
      date: "Nov 15, 2025",
      color: "border-event-blue",
    },
    {
      id: 2,
      title: "Community Meetup",
      location: "Central Park",
      date: "Nov 18, 2025",
      color: "border-event-green",
    },
    {
      id: 3,
      title: "Art Exhibition",
      location: "City Art Gallery",
      date: "Nov 20, 2025",
      color: "border-event-orange",
    },
  ];

  const upcomingEventsList = [
    { id: 1, title: "Event 1", color: "bg-event-blue" },
    { id: 2, title: "Event 2", color: "bg-event-green" },
  ];

  return (
    <PageLayout>
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Social Hub</h1>
            </div>

            {/* Event Locations Map */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Event Locations</h2>
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="h-64 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-lg relative">
                {/* Placeholder pins */}
                <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-event-blue rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-event-red rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="absolute bottom-1/3 left-1/2 w-8 h-8 bg-event-green rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-event-orange rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="absolute bottom-1/4 right-1/3 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </div>
            </Card>

            {/* Your Events */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Your Events</h2>
              <div className="space-y-3">
                {events.map((event) => (
                  <Card key={event.id} className={`p-4 border-l-4 ${event.color}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{event.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Bell className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Calendar className="w-4 h-4 text-accent" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Events
              </h2>
              
              {/* Calendar placeholder */}
              <div className="mb-6 p-4 bg-secondary/20 rounded-lg">
                <div className="text-center text-sm font-semibold mb-2">November 2025</div>
                <div className="grid grid-cols-7 gap-1 text-xs text-center">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="text-muted-foreground py-1">{day}</div>
                  ))}
                  {Array.from({ length: 30 }, (_, i) => (
                    <div key={i} className="py-1">{i + 1}</div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {upcomingEventsList.map((event) => (
                  <div key={event.id}>
                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg mb-2">
                      <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                      <span className="text-sm">{event.title}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Add to Calendar
                    </Button>
                  </div>
                ))}
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SocialHub;
