"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';
import { PageLayout } from '@/components/PageLayout';
import {
  Brain,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronLeft,
  Zap,
  AlertCircle
} from 'lucide-react';

export default function StudyDeck() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyStats, setStudyStats] = useState({ correct: 0, total: 0, streak: 0 });

  // TRPC queries
  const { data: deckData } = trpc.flashcards.decks.single.useQuery(
    { id: deckId },
    { enabled: !!deckId }
  );
  const { data: cards } = trpc.flashcards.get.useQuery(
    { deckId },
    { enabled: !!deckId }
  );

  // Handle flashcard answer
  const handleFlashcardAnswer = (correct: boolean) => {
    if (!cards) return;

    const newStats = {
      correct: studyStats.correct + (correct ? 1 : 0),
      total: studyStats.total + 1,
      streak: correct ? studyStats.streak + 1 : 0,
    };
    setStudyStats(newStats);

    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // Study session complete
      toast.success(`Study session complete! Score: ${newStats.correct}/${newStats.total}`);
      router.push('/study-tools');
    }
  };

  const currentCard = cards && cards.length > 0 ? cards[currentCardIndex] : null;
  const studyProgress = cards ? ((currentCardIndex + 1) / cards.length) * 100 : 0;

  if (!deckData || !cards) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading deck...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (cards.length === 0) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button variant="outline" onClick={() => router.push('/study-tools')} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Study Tools
            </Button>
          </div>

          <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
            <CardContent className="p-16 text-center">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No flashcards in this deck</h3>
              <p className="text-sm text-muted-foreground mb-6">Add some flashcards to start studying</p>
              <Button onClick={() => router.push(`/study-tools/deck/${deckId}`)} className="gap-2">
                Manage Deck
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/study-tools')} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Study Tools
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{deckData.title}</h1>
              <p className="text-muted-foreground">Study session in progress</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="w-3 h-3" />
              {studyStats.correct}/{studyStats.total}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Zap className="w-3 h-3" />
              Streak: {studyStats.streak}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Card {currentCardIndex + 1} of {cards.length}</span>
            <span>{Math.round(studyProgress)}% complete</span>
          </div>
          <Progress value={studyProgress} className="h-2" />
        </div>

        {/* Flashcard */}
        <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-8 relative z-10">
            {currentCard && (
              <div className="text-center space-y-8">
                <div className="min-h-[300px] flex items-center justify-center">
                  <div className="text-center space-y-6 max-w-2xl">
                    <div className="text-lg text-muted-foreground mb-4">Question</div>
                    <div className="text-3xl font-semibold leading-relaxed">
                      {currentCard.front}
                    </div>
                  </div>
                </div>

                {showAnswer ? (
                  <div className="space-y-6">
                    <div className="border-t pt-6">
                      <div className="text-lg text-muted-foreground mb-4">Answer</div>
                      <div className="text-2xl font-medium text-primary leading-relaxed">
                        {currentCard.back}
                      </div>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => handleFlashcardAnswer(false)}
                        variant="outline"
                        size="lg"
                        className="gap-2 px-8"
                      >
                        <XCircle className="w-5 h-5" />
                        Incorrect
                      </Button>
                      <Button
                        onClick={() => handleFlashcardAnswer(true)}
                        size="lg"
                        className="gap-2 px-8"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Correct
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowAnswer(true)}
                    size="lg"
                    className="gap-2 px-8"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Show Answer
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}