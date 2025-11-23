"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
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
import { trpc } from '@/lib/trpc-client';
import { toast } from 'sonner';
import { PageLayout } from '@/components/PageLayout';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  Play,
  Target,
  AlertCircle
} from 'lucide-react';

export default function ManageDeck() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const [showCreateCard, setShowCreateCard] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState({ front: '', back: '', difficulty: 3 });
  const [cardErrors, setCardErrors] = useState<{ [key: string]: string }>({});

  // TRPC queries
  const { data: deckData } = trpc.flashcards.decks.single.useQuery(
    { id: deckId },
    { enabled: !!deckId }
  );
  const { data: cards, refetch: refetchCards } = trpc.flashcards.get.useQuery(
    { deckId },
    { enabled: !!deckId }
  );
  const { data: deckStats } = trpc.flashcards.stats.deck.get.useQuery(
    { id: deckId },
    { enabled: !!deckId }
  );

  // TRPC mutations
  const createCardMutation = trpc.flashcards.create.useMutation();
  const updateCardMutation = trpc.flashcards.update.useMutation();
  const deleteCardMutation = trpc.flashcards.delete.useMutation();

  // Error handler
  const handleFormError = (error: unknown, setFieldErrors: (errors: { [key: string]: string }) => void) => {
    const err = error as { data?: { httpStatus?: number; message?: string }; status?: number; code?: string; message?: string };
    if (err?.data?.httpStatus === 500 || err?.status === 500 || err?.code === 'INTERNAL_SERVER_ERROR') {
      toast.error('Internal server error. Please try again later.');
      return;
    }

    setFieldErrors({});
    if (err?.message || err?.data?.message) {
      const errorMessage = err?.message || err?.data?.message || 'An error occurred';
      const sanitizedMessage = errorMessage
        .replace(/password/gi, 'credential')
        .replace(/token/gi, 'session')
        .replace(/secret/gi, 'key')
        .replace(/\b\d{4,}\b/g, '****')
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 'user@example.com');

      const fieldPatterns = {
        front: /front/i,
        back: /back/i,
      };

      const fieldErrors: { [key: string]: string } = {};
      for (const [field, pattern] of Object.entries(fieldPatterns)) {
        if (pattern.test(sanitizedMessage)) {
          fieldErrors[field] = sanitizedMessage;
          setFieldErrors(fieldErrors);
          return;
        }
      }

      toast.error('Operation failed', { description: sanitizedMessage });
    } else {
      toast.error('Something went wrong', { description: 'Please try again later.' });
    }
  };

  // Form handlers
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardErrors({});

    try {
      await createCardMutation.mutateAsync({ ...cardForm, deckId });
      setShowCreateCard(false);
      setCardForm({ front: '', back: '', difficulty: 3 });
      refetchCards();
      toast.success('Card created successfully!');
    } catch (err: unknown) {
      handleFormError(err, setCardErrors);
    }
  };

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    setCardErrors({});
    try {
      await updateCardMutation.mutateAsync({ id: editingCard, ...cardForm });
      setShowCreateCard(false);
      setEditingCard(null);
      setCardForm({ front: '', back: '', difficulty: 3 });
      refetchCards();
      toast.success('Card updated successfully!');
    } catch (err: unknown) {
      handleFormError(err, setCardErrors);
    }
  };

  const handleDeleteCard = async () => {
    if (!deleteCardId) return;

    try {
      await deleteCardMutation.mutateAsync({ id: deleteCardId });
      refetchCards();
      toast.success('Card deleted successfully!');
      setDeleteCardId(null);
    } catch (err: unknown) {
      toast.error('Failed to delete card');
    }
  };

  const editCard = (card: { id: string; front: string; back: string; difficulty: number }) => {
    setEditingCard(card.id);
    setCardForm({ front: card.front, back: card.back, difficulty: card.difficulty });
    setShowCreateCard(true);
  };

  if (!deckData) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto">
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

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push('/study-tools')} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back to Study Tools
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Managing: {deckData.title}</h1>
                <p className="text-muted-foreground">{deckData.description || 'Manage your flashcards'}</p>
                {deckStats && (
                  <div className="text-sm text-muted-foreground mt-2 flex gap-4 items-center">
                    <div>Avg: <span className="font-semibold">{deckStats.averageScore}%</span></div>
                    <div>Cards: <span className="font-semibold">{deckStats.cardCount}</span></div>
                    <div>Quizzes: <span className="font-semibold">{deckStats.quizCount}</span></div>
                    {deckStats.lastCompletedAt && (
                      <div className="text-xs">Last quiz: <span className="ml-1 font-medium">{new Date(deckStats.lastCompletedAt).toLocaleDateString()}</span></div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/study-tools/study/${deckId}`)}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Study
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/study-tools/quiz/${deckId}`)}
                className="gap-2"
              >
                <Target className="w-4 h-4" />
                Quiz
              </Button>
              <Dialog open={showCreateCard} onOpenChange={(open) => {
                setShowCreateCard(open);
                if (!open) {
                  setCardErrors({});
                  setCardForm({ front: '', back: '', difficulty: 3 });
                  setEditingCard(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md border-0 shadow-xl bg-card/95 backdrop-blur-sm">
                  <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-semibold">
                          {editingCard ? 'Edit Card' : 'Create Flashcard'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingCard ? 'Update the flashcard content' : 'Add a new flashcard to this deck'}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <form onSubmit={editingCard ? handleUpdateCard : handleCreateCard} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-front">Question (Front)</Label>
                      <Textarea
                        id="card-front"
                        value={cardForm.front}
                        onChange={(e) => setCardForm({ ...cardForm, front: e.target.value })}
                        placeholder="Enter the question or term"
                        className={`min-h-20 ${cardErrors.front ? 'border-destructive focus:border-destructive' : ''}`}
                        required
                      />
                      {cardErrors.front && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          {cardErrors.front}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-back">Answer (Back)</Label>
                      <Textarea
                        id="card-back"
                        value={cardForm.back}
                        onChange={(e) => setCardForm({ ...cardForm, back: e.target.value })}
                        placeholder="Enter the answer or definition"
                        className={`min-h-20 ${cardErrors.back ? 'border-destructive focus:border-destructive' : ''}`}
                        required
                      />
                      {cardErrors.back && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          {cardErrors.back}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-difficulty">Difficulty Level</Label>
                      <Select
                        value={cardForm.difficulty.toString()}
                        onValueChange={(value) => setCardForm({ ...cardForm, difficulty: parseInt(value) })}
                      >
                        <SelectTrigger className={`h-11 ${cardErrors.difficulty ? 'border-destructive' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Easy (1)</SelectItem>
                          <SelectItem value="2">Medium-Easy (2)</SelectItem>
                          <SelectItem value="3">Medium (3)</SelectItem>
                          <SelectItem value="4">Medium-Hard (4)</SelectItem>
                          <SelectItem value="5">Hard (5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={createCardMutation.isPending || updateCardMutation.isPending} className="flex-1">
                        {createCardMutation.isPending || updateCardMutation.isPending ?
                          (editingCard ? 'Updating...' : 'Creating...') :
                          (editingCard ? 'Update Card' : 'Create Card')
                        }
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateCard(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Cards List */}
        <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Flashcards ({cards?.length || 0})
            </CardTitle>
            <CardDescription>
              Manage your flashcards in this deck
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            {cards && cards.length > 0 ? (
              <div className="grid gap-4">
                {cards.map((card: { id: string; front: string; back: string; difficulty: number }, index: number) => (
                  <Card key={card.id} className="group/card hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <Badge
                              variant={card.difficulty <= 2 ? "secondary" : card.difficulty <= 4 ? "default" : "destructive"}
                              className="text-xs"
                            >
                              Difficulty: {card.difficulty}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">Question</div>
                              <div className="text-sm line-clamp-3">{card.front}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">Answer</div>
                              <div className="text-sm line-clamp-3">{card.back}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editCard(card)}
                            className="gap-1"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <AlertDialog open={deleteCardId === card.id} onOpenChange={(open) => !open && setDeleteCardId(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="gap-1"
                                onClick={() => setDeleteCardId(card.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Flashcard</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this flashcard? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteCard}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Card
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No flashcards yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first flashcard to get started</p>
                <Button onClick={() => setShowCreateCard(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add First Card
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}