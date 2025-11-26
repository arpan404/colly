"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';
import {
  Target,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function QuizDeck() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TRPC queries
  const { data: deckData } = trpc.flashcards.decks.single.useQuery(
    { id: deckId },
    { enabled: !!deckId }
  );
  const { data: cards } = trpc.flashcards.get.useQuery(
    { deckId },
    { enabled: !!deckId }
  );
  const createQuizResultMutation = trpc.flashcards.quiz.result.create.useMutation();

  // Initialize quiz
  const startQuiz = () => {
    if (cards) {
      setQuizAnswers(new Array(cards.length).fill(''));
      setQuizStartTime(new Date());
    }
  };

  // Handle quiz submission
  const handleQuizSubmit = async () => {
    if (!cards || !quizStartTime || isSubmitting) return;

    setIsSubmitting(true);
    const score = quizAnswers.reduce((acc, answer, index) => {
      return acc + (answer.toLowerCase().trim() === cards[index].back.toLowerCase().trim() ? 1 : 0);
    }, 0);

    const timeSpent = Math.floor((new Date().getTime() - quizStartTime.getTime()) / 1000);

    try {
      await createQuizResultMutation.mutateAsync({
        deckId,
        score,
        totalQuestions: cards.length,
        timeSpent,
      });

      toast.success(`Quiz complete! Score: ${score}/${cards.length}`);
      router.push('/study-tools');
    } catch (err: unknown) {
      toast.error('Failed to save quiz results');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle answer change
  const handleAnswerChange = (index: number, answer: string) => {
    const newAnswers = [...quizAnswers];
    newAnswers[index] = answer;
    setQuizAnswers(newAnswers);
  };

  if (!deckData || !cards) {
    return (
      
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading deck...</p>
            </div>
          </div>
        </div>
      
    );
  }

  if (cards.length === 0) {
    return (
      
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
              <p className="text-sm text-muted-foreground mb-6">Add some flashcards to take a quiz</p>
              <Button onClick={() => router.push(`/study-tools/deck/${deckId}`)} className="gap-2">
                Manage Deck
              </Button>
            </CardContent>
          </Card>
        </div>
      
    );
  }

  if (!quizStartTime) {
    return (
      
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
                <p className="text-muted-foreground">Quiz mode</p>
              </div>
            </div>
          </div>

          {/* Quiz Start */}
          <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-16 text-center relative z-10">
              <Target className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Ready to take the quiz?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                You'll be asked to answer {cards.length} question{cards.length !== 1 ? 's' : ''}.
                Take your time and answer each question carefully.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={startQuiz} size="lg" className="gap-2 px-8">
                  <Target className="w-5 h-5" />
                  Start Quiz
                </Button>
                <Button variant="outline" onClick={() => router.push('/study-tools')} className="gap-2 px-8">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      
    );
  }

  const currentCard = cards[currentCardIndex];
  const quizProgress = ((currentCardIndex + 1) / cards.length) * 100;
  const isLastQuestion = currentCardIndex === cards.length - 1;

  return (
    
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
              <p className="text-muted-foreground">Quiz in progress</p>
            </div>
          </div>

          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Question {currentCardIndex + 1} of {cards.length}
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(quizProgress)}% complete</span>
          </div>
          <Progress value={quizProgress} className="h-2" />
        </div>

        {/* Quiz Question */}
        <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-8 relative z-10">
            <div className="text-center space-y-8">
              <div className="text-lg text-muted-foreground">
                Question {currentCardIndex + 1} of {cards.length}
              </div>

              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center space-y-6 max-w-2xl">
                  <div className="text-2xl font-semibold leading-relaxed">
                    {currentCard.front}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="quiz-answer" className="text-base font-medium">Your Answer</Label>
                <Textarea
                  id="quiz-answer"
                  value={quizAnswers[currentCardIndex] || ''}
                  onChange={(e) => handleAnswerChange(currentCardIndex, e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-24 text-lg"
                  autoFocus
                />
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    if (isLastQuestion) {
                      handleQuizSubmit();
                    } else {
                      setCurrentCardIndex(currentCardIndex + 1);
                    }
                  }}
                  size="lg"
                  className="gap-2 px-8"
                  disabled={!quizAnswers[currentCardIndex]?.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : isLastQuestion ? (
                    <>
                      Finish Quiz
                      <CheckCircle className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Next Question
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
}