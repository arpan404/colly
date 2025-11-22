import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Bell } from "lucide-react";

const Dashboard = () => {
  const upcomingEvents = [
    { id: 1, title: "Event 1", color: "bg-event-red" },
    { id: 2, title: "Event 2", color: "bg-event-green" },
    { id: 3, title: "Event 3", color: "bg-event-blue" },
    { id: 4, title: "Event 4", color: "bg-event-orange" },
  ];

  return (
    <PageLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div></div>
          <Bell className="w-6 h-6 text-foreground cursor-pointer" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tip of the hour */}
            <Card className="p-6 bg-secondary/30">
              <h2 className="text-lg font-semibold mb-4">Tip of the hour</h2>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm">
                  Drink water, sleep enough, and move a little every day — your brain works best when your body feels good. 💪🧠
                </p>
              </div>
            </Card>

            {/* Budget Analytics */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Your budget Analytics</h2>
              <div className="h-48 bg-secondary/20 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Chart placeholder</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>Spent most in Food</div>
                <div>Spent least in Self-care</div>
              </div>
            </Card>

            {/* Flashcards */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Flashcards</h2>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 bg-secondary/30">
                  <p className="text-sm font-medium">Mitochondria is the powerhouse of cell.</p>
                </Card>
                <Card className="p-6 bg-secondary/30">
                  <p className="text-sm font-medium">
                    Time complexity of inserting an element into a Binary Search Tree (BST) on average and in the worst case?
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Average Case: O(log n)<br />
                    Worst Case: O(n)
                  </p>
                </Card>
              </div>
            </div>

            {/* Shortcuts */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Shortcuts</h2>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="secondary" className="h-16">Quizes/ Trivia</Button>
                <Button variant="secondary" className="h-16">Budget Report</Button>
                <Button variant="secondary" className="h-16">Create an Event</Button>
                <Button variant="secondary" className="h-16">Your Routine</Button>
              </div>
            </div>
          </div>

          {/* Right sidebar - Upcoming Events */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Events
              </h2>
              
              {/* Calendar placeholder */}
              <div className="mb-6 p-4 bg-secondary/20 rounded-lg">
                <div className="text-center text-sm text-muted-foreground">Calendar view</div>
              </div>

              {/* Events list */}
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

export default Dashboard;
