"use client";

import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Plus, Sparkles, Trophy, Target, Clock, BarChart3, Play, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { trpc } from '@/lib/trpc-client';
import { useState } from 'react';

const StudyTools = () => {
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyStats, setStudyStats] = useState({ correct: 0, total: 0 });

  const { data: decks, isLoading } = trpc.flashcards.decks.get.useQuery();
  const { data: cards } = trpc.flashcards.get.useQuery(
    { deckId: selectedDeck! },
    { enabled: !!selectedDeck }
  );

  const yourResources = [
    { id: 1, title: "Spanish Vocabulary", type: "Flashcards", cards: 45, progress: 75 },
    { id: 2, title: "Math Formulas", type: "Reference", cards: 0, progress: 100 },
  ];

  const sharedResources = [
    { id: 1, title: "Chemistry Notes", type: "Notes", sharedBy: "Alex", cards: 0 },
    { id: 2, title: "History Dates", type: "Flashcards", sharedBy: "Sam", cards: 32 },
    { id: 3, title: "Programming Concepts", type: "Reference", sharedBy: "Jordan", cards: 0 },
  ];

  const practiceItems = [
    { id: 1, title: "Daily Quiz", icon: Trophy, description: "Test your knowledge", color: "text-yellow-600" },
    { id: 2, title: "Speed Review", icon: Clock, description: "Quick revision session", color: "text-blue-600" },
    { id: 3, title: "Weak Topics", icon: Target, description: "Focus on difficult areas", color: "text-red-600" },
  ];

  const startStudy = (deckId: string) => {
    setSelectedDeck(deckId);
    setStudyMode(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudyStats({ correct: 0, total: 0 });
  };

  const handleAnswer = (correct: boolean) => {
    if (!cards) return;
    const newStats = {
      correct: studyStats.correct + (correct ? 1 : 0),
      total: studyStats.total + 1,
    };
    setStudyStats(newStats);

    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // Study session complete
      setStudyMode(false);
      alert(`Study session complete! Score: ${newStats.correct}/${newStats.total}`);
    }
  };

  const currentCard = cards && cards.length > 0 ? cards[currentCardIndex] : null;

  return (
    <PageLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Study Tools</h1>
            </div>
            <p className="text-muted-foreground">Enhance your learning with interactive flashcards and study resources</p>
          </div>

          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Resource
          </Button>
        </div>

        {!studyMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Flashcard Decks */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Your Flashcard Decks
                  </CardTitle>
                  <CardDescription>
                    Study with your personalized flashcard collections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading decks...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(decks && decks.length > 0 ? decks : [{ deck: { id: "1", title: "Sample Deck", description: "Get started with flashcards" }, cardCount: 0 }]).map((item: any) => (
                        <Card key={item.deck.id} className="shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer" onClick={() => startStudy(item.deck.id)}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-primary" />
                              </div>
                              <Badge variant="secondary">{item.cardCount} cards</Badge>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{item.deck.title}</h3>
                            {item.deck.description && (
                              <p className="text-sm text-muted-foreground mb-4">{item.deck.description}</p>
                            )}
                            <Button className="w-full gap-2">
                              <Play className="w-4 h-4" />
                              Start Studying
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Study Stats */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Study Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">85%</div>
                    <div className="text-sm text-muted-foreground">Overall Progress</div>
                    <Progress value={85} className="mt-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-semibold text-green-600">12</div>
                      <div className="text-xs text-muted-foreground">Decks Studied</div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-blue-600">247</div>
                      <div className="text-xs text-muted-foreground">Cards Reviewed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Practice Activities */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Practice Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {practiceItems.map((item) => (
                      <div key={item.id} className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{item.title}</h4>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Study Mode */
          <Card className="shadow-lg max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Study Session
                </CardTitle>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {studyStats.correct}/{studyStats.total}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setStudyMode(false)}>
                    Exit
                  </Button>
                </div>
              </div>
              <Progress value={((currentCardIndex + 1) / (cards?.length || 1)) * 100} className="mt-4" />
            </CardHeader>
            <CardContent>
              {currentCard && (
                <div className="text-center space-y-8">
                  <div className="text-sm text-muted-foreground">
                    Card {currentCardIndex + 1} of {cards?.length || 0}
                  </div>

                  <div className="min-h-[200px] flex items-center justify-center">
                    <div className="text-2xl font-semibold max-w-lg">
                      {!showAnswer ? currentCard.front : currentCard.back}
                    </div>
                  </div>

                  {!showAnswer ? (
                    <Button
                      onClick={() => setShowAnswer(true)}
                      size="lg"
                      className="gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Show Answer
                    </Button>
                  ) : (
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => handleAnswer(false)}
                        variant="destructive"
                        size="lg"
                        className="gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Incorrect
                      </Button>
                      <Button
                        onClick={() => handleAnswer(true)}
                        size="lg"
                        className="gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Correct
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Resources Section */}
        {!studyMode && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Your Resources */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Your Resources
                </CardTitle>
                <CardDescription>
                  Personal study materials and references
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {yourResources.map((resource) => (
                    <div key={resource.id} className="p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{resource.title}</h4>
                        <Badge variant="outline">{resource.type}</Badge>
                      </div>
                      {resource.cards > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{resource.cards} cards</span>
                            <span>{resource.progress}% complete</span>
                          </div>
                          <Progress value={resource.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shared Resources */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Shared with You
                </CardTitle>
                <CardDescription>
                  Resources shared by other users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sharedResources.map((resource) => (
                    <div key={resource.id} className="p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{resource.title}</h4>
                        <Badge variant="secondary">{resource.type}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Shared by {resource.sharedBy}</span>
                        {resource.cards > 0 && <span>{resource.cards} cards</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default StudyTools;