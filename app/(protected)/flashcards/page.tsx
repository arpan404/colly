'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc-client';
import { BookOpen, Plus, Play, RotateCcw, CheckCircle, XCircle, Brain, Trophy, Target, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function FlashcardsPage() {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [showDeckForm, setShowDeckForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  // Quiz completion dialog state
  const [showQuizCompleteDialog, setShowQuizCompleteDialog] = useState(false);
  const [finalQuizScore, setFinalQuizScore] = useState({ correct: 0, total: 0 });

  const { data: decks, refetch: refetchDecks } = trpc.flashcards.decks.get.useQuery();
  const { data: cards, refetch: refetchCards } = trpc.flashcards.get.useQuery(
    { deckId: selectedDeckId! },
    { enabled: !!selectedDeckId }
  );

  const createDeckMutation = trpc.flashcards.decks.create.useMutation();
  const createCardMutation = trpc.flashcards.create.useMutation();
  const createQuizResultMutation = trpc.flashcards.quiz.result.create.useMutation();

  const [deckForm, setDeckForm] = useState({
    title: '',
    description: '',
    category: '',
    isPublic: false,
  });

  const [cardForm, setCardForm] = useState({
    front: '',
    back: '',
    difficulty: 3,
  });

  const [deckFormErrors, setDeckFormErrors] = useState<Record<string, string>>({});
  const [cardFormErrors, setCardFormErrors] = useState<Record<string, string>>({});

  const handleFormError = (error: any, formType: 'deck' | 'card') => {
    // Check if it's a 500 internal server error
    if (error?.code === 'INTERNAL_SERVER_ERROR' || error?.status === 500) {
      toast.error('Internal server error. Please try again later.');
      return;
    }

    const errorMessage = error?.message || 'An unexpected error occurred';
    
    // Sanitize error message to remove sensitive information
    const sanitizedMessage = errorMessage.replace(/password|token|key/gi, '[REDACTED]');
    
    // Set the appropriate form errors
    if (formType === 'deck') {
      // Check for field-specific errors
      if (sanitizedMessage.includes('title') || sanitizedMessage.includes('Title')) {
        setDeckFormErrors({ title: sanitizedMessage });
      } else if (sanitizedMessage.includes('description') || sanitizedMessage.includes('Description')) {
        setDeckFormErrors({ description: sanitizedMessage });
      } else if (sanitizedMessage.includes('category') || sanitizedMessage.includes('Category')) {
        setDeckFormErrors({ category: sanitizedMessage });
      } else {
        // General error - show toast
        toast.error(sanitizedMessage);
      }
    } else {
      // Check for field-specific errors
      if (sanitizedMessage.includes('front') || sanitizedMessage.includes('Front')) {
        setCardFormErrors({ front: sanitizedMessage });
      } else if (sanitizedMessage.includes('back') || sanitizedMessage.includes('Back')) {
        setCardFormErrors({ back: sanitizedMessage });
      } else if (sanitizedMessage.includes('difficulty') || sanitizedMessage.includes('Difficulty')) {
        setCardFormErrors({ difficulty: sanitizedMessage });
      } else {
        // General error - show toast
        toast.error(sanitizedMessage);
      }
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeckFormErrors({});
    
    try {
      await createDeckMutation.mutateAsync(deckForm);
      setShowDeckForm(false);
      setDeckForm({ title: '', description: '', category: '', isPublic: false });
      refetchDecks();
      toast.success('Deck created successfully!');
    } catch (err) {
      handleFormError(err, 'deck');
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeckId) return;
    setCardFormErrors({});
    
    try {
      await createCardMutation.mutateAsync({ ...cardForm, deckId: selectedDeckId });
      setShowCardForm(false);
      setCardForm({ front: '', back: '', difficulty: 3 });
      refetchCards();
      toast.success('Card added successfully!');
    } catch (err) {
      handleFormError(err, 'card');
    }
  };

  const startQuiz = () => {
    if (!cards || cards.length === 0) return;
    setQuizMode(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setQuizScore({ correct: 0, total: 0 });
  };

  const handleQuizAnswer = (correct: boolean) => {
    if (!cards) return;
    const newScore = {
      correct: quizScore.correct + (correct ? 1 : 0),
      total: quizScore.total + 1,
    };
    setQuizScore(newScore);

    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // Quiz complete
      if (selectedDeckId) {
        createQuizResultMutation.mutate({
          deckId: selectedDeckId,
          score: newScore.correct,
          totalQuestions: newScore.total,
        });
      }
      setFinalQuizScore(newScore);
      setShowQuizCompleteDialog(true);
    }
  };

  const currentCard = cards && cards.length > 0 ? cards[currentCardIndex] : null;
  const selectedDeck = decks?.find((d: any) => d.deck.id === selectedDeckId);

  return (
    <PageLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Flashcards</h1>
            </div>
            <p className="text-muted-foreground">Create and study with interactive flashcard decks</p>
          </div>

          <Dialog open={showDeckForm} onOpenChange={(open) => {
            setShowDeckForm(open);
            if (!open) {
              setDeckFormErrors({});
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Deck
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  Create New Deck
                </DialogTitle>
                <DialogDescription>
                  Create a new flashcard deck to organize your study materials.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDeck} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deck-title">Deck Title *</Label>
                  <div className="relative">
                    <Input
                      id="deck-title"
                      type="text"
                      value={deckForm.title}
                      onChange={(e) => setDeckForm({ ...deckForm, title: e.target.value })}
                      placeholder="e.g., Spanish Vocabulary, Math Formulas"
                      required
                      className={deckFormErrors.title ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {deckFormErrors.title && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {deckFormErrors.title && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {deckFormErrors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deck-description">Description</Label>
                  <div className="relative">
                    <Textarea
                      id="deck-description"
                      value={deckForm.description}
                      onChange={(e) => setDeckForm({ ...deckForm, description: e.target.value })}
                      placeholder="Brief description of this deck..."
                      rows={2}
                      className={deckFormErrors.description ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {deckFormErrors.description && (
                      <AlertCircle className="absolute right-3 top-3 w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {deckFormErrors.description && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {deckFormErrors.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deck-category">Category</Label>
                  <div className="relative">
                    <Input
                      id="deck-category"
                      type="text"
                      value={deckForm.category}
                      onChange={(e) => setDeckForm({ ...deckForm, category: e.target.value })}
                      placeholder="e.g., Language, Science, History"
                      className={deckFormErrors.category ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {deckFormErrors.category && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {deckFormErrors.category && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {deckFormErrors.category}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deck-public"
                    checked={deckForm.isPublic}
                    onCheckedChange={(checked) => setDeckForm({ ...deckForm, isPublic: checked as boolean })}
                  />
                  <Label htmlFor="deck-public" className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4" />
                    Make this deck public
                  </Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createDeckMutation.isPending} className="flex-1">
                    {createDeckMutation.isPending ? 'Creating...' : 'Create Deck'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowDeckForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Decks Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Your Decks
                </CardTitle>
                <CardDescription>
                  {decks?.length || 0} deck{decks?.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {decks && decks.length > 0 ? (
                  <div className="space-y-3">
                    {decks.map((item: any) => (
                      <Card
                        key={item.deck.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedDeckId === item.deck.id
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'hover:bg-secondary/50'
                        }`}
                        onClick={() => {
                          setSelectedDeckId(item.deck.id);
                          setQuizMode(false);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm">{item.deck.title}</h4>
                            {item.deck.isPublic && (
                              <Badge variant="secondary" className="text-xs">Public</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Target className="w-3 h-3" />
                            <span>{Number(item.cardCount)} cards</span>
                          </div>
                          {item.deck.category && (
                            <Badge variant="outline" className="text-xs mt-2">
                              {item.deck.category}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">No decks yet</p>
                    <Button size="sm" onClick={() => setShowDeckForm(true)} className="gap-2">
                      <Plus className="w-3 h-3" />
                      Create First Deck
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedDeckId ? (
              <>
                {!quizMode ? (
                  <div className="space-y-6">
                    {/* Deck Header */}
                    <Card className="shadow-lg">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-2xl">{selectedDeck?.deck.title}</CardTitle>
                            {selectedDeck?.deck.description && (
                              <CardDescription className="mt-2">
                                {selectedDeck.deck.description}
                              </CardDescription>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {cards && cards.length > 0 && (
                              <Button onClick={startQuiz} className="gap-2">
                                <Play className="w-4 h-4" />
                                Start Quiz
                              </Button>
                            )}

                            <Dialog open={showCardForm} onOpenChange={(open) => {
                              setShowCardForm(open);
                              if (!open) {
                                setCardFormErrors({});
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                  <Plus className="w-4 h-4" />
                                  Add Card
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                      <Plus className="w-4 h-4 text-primary" />
                                    </div>
                                    Add New Card
                                  </DialogTitle>
                                  <DialogDescription>
                                    Create a new flashcard for this deck.
                                  </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateCard} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="card-front">Front (Question) *</Label>
                                    <div className="relative">
                                      <Textarea
                                        id="card-front"
                                        value={cardForm.front}
                                        onChange={(e) => setCardForm({ ...cardForm, front: e.target.value })}
                                        placeholder="Enter the question or prompt..."
                                        rows={3}
                                        required
                                        className={cardFormErrors.front ? 'border-red-500 focus:border-red-500' : ''}
                                      />
                                      {cardFormErrors.front && (
                                        <AlertCircle className="absolute right-3 top-3 w-4 h-4 text-red-500" />
                                      )}
                                    </div>
                                    {cardFormErrors.front && (
                                      <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {cardFormErrors.front}
                                      </p>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="card-back">Back (Answer) *</Label>
                                    <div className="relative">
                                      <Textarea
                                        id="card-back"
                                        value={cardForm.back}
                                        onChange={(e) => setCardForm({ ...cardForm, back: e.target.value })}
                                        placeholder="Enter the answer or explanation..."
                                        rows={3}
                                        required
                                        className={cardFormErrors.back ? 'border-red-500 focus:border-red-500' : ''}
                                      />
                                      {cardFormErrors.back && (
                                        <AlertCircle className="absolute right-3 top-3 w-4 h-4 text-red-500" />
                                      )}
                                    </div>
                                    {cardFormErrors.back && (
                                      <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {cardFormErrors.back}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex gap-2 pt-4">
                                    <Button type="submit" disabled={createCardMutation.isPending} className="flex-1">
                                      {createCardMutation.isPending ? 'Adding...' : 'Add Card'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowCardForm(false)}>
                                      Cancel
                                    </Button>
                                  </div>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Cards List */}
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" />
                          Cards ({cards?.length || 0})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {cards && cards.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cards.map((card: any, index: number) => (
                              <Card key={card.id} className="shadow-md hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <Badge variant="outline" className="text-xs">
                                      Card {index + 1}
                                    </Badge>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <div className="text-xs font-medium text-muted-foreground mb-1">FRONT</div>
                                      <div className="text-sm font-medium">{card.front}</div>
                                    </div>
                                    <div className="border-t pt-3">
                                      <div className="text-xs font-medium text-muted-foreground mb-1">BACK</div>
                                      <div className="text-sm text-muted-foreground">{card.back}</div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No cards yet</h3>
                            <p className="text-muted-foreground mb-6">
                              Add your first flashcard to start studying
                            </p>
                            <Button onClick={() => setShowCardForm(true)} className="gap-2">
                              <Plus className="w-4 h-4" />
                              Add First Card
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  /* Quiz Mode */
                  <Card className="shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-primary" />
                          Quiz Mode
                        </CardTitle>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            Card {currentCardIndex + 1} of {cards?.length || 0}
                          </div>
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {quizScore.correct}/{quizScore.total}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={((currentCardIndex + 1) / (cards?.length || 1)) * 100} className="mt-4" />
                    </CardHeader>
                    <CardContent>
                      {currentCard && (
                        <div className="text-center space-y-8">
                          <div className="min-h-[200px] flex items-center justify-center">
                            <div className="text-2xl font-semibold max-w-2xl">
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
                                onClick={() => handleQuizAnswer(false)}
                                variant="destructive"
                                size="lg"
                                className="gap-2"
                              >
                                <XCircle className="w-5 h-5" />
                                Incorrect
                              </Button>
                              <Button
                                onClick={() => handleQuizAnswer(true)}
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
              </>
            ) : (
              <Card className="shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">Select a deck to get started</h3>
                  <p className="text-muted-foreground text-center">
                    Choose a flashcard deck from the sidebar to view cards or start a quiz
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Complete Dialog */}
      <AlertDialog open={showQuizCompleteDialog} onOpenChange={setShowQuizCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Quiz Complete!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Great job! You scored {finalQuizScore.correct} out of {finalQuizScore.total} questions correctly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowQuizCompleteDialog(false);
                setQuizMode(false);
                setQuizScore({ correct: 0, total: 0 });
                setCurrentCardIndex(0);
                setShowAnswer(false);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}

