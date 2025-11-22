import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Sparkles, Trophy } from "lucide-react";

const StudyTools = () => {
  const decks = ["Deck 1", "Deck 2", "Deck 3"];
  const yourResources = ["Resource 1"];
  const sharedResources = ["Resource 1", "Flashcard Deck 1", "Resource 2"];
  const practiceItems = [
    { id: 1, title: "Quiz 1", icon: Trophy },
    { id: 2, title: "Trivia 1", icon: Sparkles },
  ];

  return (
    <PageLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Study Tools</h1>
          <Button className="bg-secondary hover:bg-secondary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Flash Card
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Flashcard Deck */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Flashcard Deck</h2>
            <div className="grid grid-cols-3 gap-4">
              {decks.map((deck, index) => (
                <button
                  key={index}
                  className="p-6 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm font-medium">{deck}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Flash Card Preview */}
          <Card className="p-6 bg-secondary/30">
            <h2 className="text-lg font-semibold mb-4">Flash Card</h2>
            <div className="h-48 flex items-center justify-center text-center p-6">
              <div>
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p className="text-sm text-muted-foreground italic">
                  (Shuffles when multiple are there)
                </p>
              </div>
            </div>
          </Card>

          {/* Your Resources */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Your Resource</h2>
            <div className="space-y-3 mb-4">
              {yourResources.map((resource, index) => (
                <div key={index} className="p-3 bg-secondary/30 rounded-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm">{resource}</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Practice & Learn</h3>
              <div className="space-y-2">
                {practiceItems.map((item) => (
                  <button
                    key={item.id}
                    className="w-full p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors flex items-center gap-2"
                  >
                    <item.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Shared with you */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Shared with you</h2>
            <div className="space-y-3">
              {sharedResources.map((resource, index) => (
                <div key={index} className="p-3 bg-secondary/30 rounded-lg flex items-center gap-2">
                  {index === 1 ? (
                    <BookOpen className="w-4 h-4 text-primary" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-sm">{resource}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default StudyTools;
