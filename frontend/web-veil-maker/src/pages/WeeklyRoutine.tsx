import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

const WeeklyRoutine = () => {
  const days = ["M", "T", "W", "Th", "F", "Sat", "Sun"];
  const hours = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm"];
  
  const events = [
    { day: 1, hour: 1, title: "CHEM Lab", color: "bg-event-blue" },
    { day: 2, hour: 2, title: "Work", color: "bg-event-blue" },
    { day: 3, hour: 2, title: "Work", color: "bg-event-blue" },
    { day: 5, hour: 2, title: "Work", color: "bg-event-blue" },
    { day: 2, hour: 5, title: "GSC", color: "bg-event-blue" },
    { day: 4, hour: 5, title: "GSC", color: "bg-event-blue" },
    { day: 2, hour: 9, title: "99¢", color: "bg-event-blue" },
    { day: 4, hour: 9, title: "99¢", color: "bg-event-blue" },
  ];

  const upcomingEvents = [
    { id: 1, title: "Event 1", color: "bg-event-red" },
    { id: 2, title: "Event 2", color: "bg-event-green" },
    { id: 3, title: "Event 3", color: "bg-event-blue" },
    { id: 4, title: "Event 4", color: "bg-event-orange" },
  ];

  return (
    <PageLayout>
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">My Schedule</h1>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Weekly Routine</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">October 6 - 12 2025 • Today</span>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="overflow-x-auto">
                  <div className="min-w-[700px]">
                    {/* Header */}
                    <div className="grid grid-cols-8 gap-2 mb-2">
                      <div></div>
                      {days.map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Time slots */}
                    {hours.map((hour, hourIndex) => (
                      <div key={hour} className="grid grid-cols-8 gap-2 mb-1">
                        <div className="text-xs text-muted-foreground py-2">{hour}</div>
                        {days.map((_, dayIndex) => {
                          const event = events.find(e => e.day === dayIndex && e.hour === hourIndex);
                          return (
                            <div key={dayIndex} className="min-h-12 bg-secondary/20 rounded relative">
                              {event && (
                                <div className={`absolute inset-0 ${event.color} rounded flex items-center justify-center`}>
                                  <span className="text-xs text-white font-medium">{event.title}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right sidebar */}
          <div>
            <Button className="w-full mb-4 bg-secondary hover:bg-secondary/90">
              Add Event +
            </Button>
            <Card className="p-6">
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                    <span className="text-sm">{event.title}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default WeeklyRoutine;
