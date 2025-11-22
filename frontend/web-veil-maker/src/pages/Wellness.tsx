import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Moon, Droplet, Sparkles, Plus, Minus } from "lucide-react";
import { useState } from "react";

const Wellness = () => {
  const [sleepHours, setSleepHours] = useState(5.5);
  const [waterGlasses, setWaterGlasses] = useState(4);

  const moods = ["😊", "😄", "😐", "😕", "😢", "😴", "😰", "😌"];

  return (
    <PageLayout>
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Wellness Hub</h1>
            </div>

            {/* Mood Selector */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">How are you feeling today?</h2>
              <div className="grid grid-cols-5 gap-4">
                {moods.map((mood, index) => (
                  <button
                    key={index}
                    className="text-5xl hover:scale-110 transition-transform"
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </Card>

            {/* Sleep Tracker */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                  <Moon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Sleep</h2>
                  <p className="text-sm text-muted-foreground">Daily goal: 7 hours</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSleepHours(Math.max(0, sleepHours - 0.5))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="text-center">
                  <div className="text-3xl font-bold">{sleepHours} <span className="text-lg">hrs</span></div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSleepHours(Math.min(12, sleepHours + 0.5))}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative w-full h-4 bg-secondary rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-foreground rounded-full transition-all"
                  style={{ width: `${(sleepHours / 7) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-primary">Good</span>
                <span className="text-sm text-muted-foreground">79% complete</span>
              </div>
            </Card>

            {/* Water Intake */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Droplet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Water Intake</h2>
                  <p className="text-sm text-muted-foreground">Daily goal: 8 glasses</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="text-center">
                  <div className="text-3xl font-bold">{waterGlasses} <span className="text-lg">/ 8</span></div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWaterGlasses(Math.min(8, waterGlasses + 1))}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-8 gap-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-12 rounded-lg ${
                      i < waterGlasses ? 'bg-primary' : 'bg-secondary'
                    }`}
                  ></div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right sidebar */}
          <div>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold">Daily Advice</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Select your mood to get personalized advice for the day!
              </p>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Wellness;
