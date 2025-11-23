"use client";

import { useState } from 'react';
import { PageLayout } from "@/components/PageLayout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc-client';
import { Plus, BookOpen, Play, Target, Edit, Trash2, Zap, Lightbulb, Calendar, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudyTools() {
  const router = useRouter();
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [deleteDeckId, setDeleteDeckId] = useState<string | null>(null);
  const [deckForm, setDeckForm] = useState({
    title: '',
    description: '',
    category: '',
    isPublic: false,
  });
  const [deckErrors, setDeckErrors] = useState<{ [key: string]: string }>({});

  // TRPC queries and mutations
  const { data: decks, isLoading: decksLoading, refetch: refetchDecks } = trpc.flashcards.decks.get.useQuery();
  const createDeckMutation = trpc.flashcards.decks.create.useMutation();
  const deleteDeckMutation = trpc.flashcards.decks.delete.useMutation();

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
        title: /title/i,
        description: /description/i,
        category: /categor/i,
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
  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeckErrors({});

    try {
      await createDeckMutation.mutateAsync(deckForm);
      setShowCreateDeck(false);
      setDeckForm({ title: '', description: '', category: '', isPublic: false });
      refetchDecks();
      toast.success('Deck created successfully!');
    } catch (err: unknown) {
      handleFormError(err, setDeckErrors);
    }
  };

  const confirmDeleteDeck = async () => {
    if (!deleteDeckId) return;

    try {
      await deleteDeckMutation.mutateAsync({ id: deleteDeckId });
      refetchDecks();
      toast.success('Deck deleted successfully!');
      setDeleteDeckId(null);
    } catch (err: unknown) {
      toast.error('Failed to delete deck');
    }
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Study Tools
                  </h1>
                  <p className="text-lg text-muted-foreground">Master your subjects with intelligent flashcards and quizzes</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Dialog open={showCreateDeck} onOpenChange={(open) => {
                setShowCreateDeck(open);
                if (!open) {
                  setDeckErrors({});
                  setDeckForm({ title: '', description: '', category: '', isPublic: false });
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2 h-11 px-4 shadow-sm hover:shadow-md transition-all duration-200">
                    <Plus className="w-4 h-4" />
                    Create Deck
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md border-0 shadow-xl bg-card/95 backdrop-blur-sm">
                  <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-semibold">Create Flashcard Deck</DialogTitle>
                        <DialogDescription>
                          Create a new deck to organize your flashcards
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <form onSubmit={handleCreateDeck} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deck-title">Deck Title</Label>
                      <Input
                        id="deck-title"
                        value={deckForm.title}
                        onChange={(e) => setDeckForm({ ...deckForm, title: e.target.value })}
                        placeholder="e.g., Spanish Vocabulary"
                        className={`h-11 ${deckErrors.title ? 'border-destructive focus:border-destructive' : ''}`}
                        required
                      />
                      {deckErrors.title && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <div className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-destructive" />
                          </div>
                          {deckErrors.title}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deck-description">Description</Label>
                      <Textarea
                        id="deck-description"
                        value={deckForm.description}
                        onChange={(e) => setDeckForm({ ...deckForm, description: e.target.value })}
                        placeholder="Brief description of this deck"
                        className={`min-h-20 ${deckErrors.description ? 'border-destructive focus:border-destructive' : ''}`}
                      />
                      {deckErrors.description && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <div className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-destructive" />
                          </div>
                          {deckErrors.description}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deck-category">Category</Label>
                      <Select value={deckForm.category} onValueChange={(value) => setDeckForm({ ...deckForm, category: value })}>
                        <SelectTrigger className={`h-11 ${deckErrors.category ? 'border-destructive' : ''}`}>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="language">Language</SelectItem>
                          <SelectItem value="math">Mathematics</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="history">History</SelectItem>
                          <SelectItem value="programming">Programming</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={createDeckMutation.isPending} className="flex-1">
                        {createDeckMutation.isPending ? 'Creating...' : 'Create Deck'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateDeck(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <div className="space-y-6">
              {/* Flashcard Decks */}
              <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative z-10 pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Flashcard Decks</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Study with your personalized flashcard collections
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  {decksLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading decks...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(decks && decks.length > 0 ? decks : [{ deck: { id: "sample", title: "Sample Deck", description: "Get started with flashcards" }, cardCount: 0 }]).map((item: any) => (
                        <Card key={item.deck.id} className="group/card relative overflow-hidden border-0 shadow-lg bg-linear-to-br from-card/40 to-card/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                          <div className="absolute inset-0 bg-linear-to-br from-primary/3 via-transparent to-primary/3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                          <CardContent className="p-6 relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-12 h-12 bg-linear-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-primary" />
                              </div>
                              <Badge variant="secondary" className="gap-1">
                                <Zap className="w-3 h-3" />
                                {item.cardCount} cards
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{item.deck.title}</h3>
                            {item.deck.description && (
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.deck.description}</p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => router.push(`/study-tools/study/${item.deck.id}`)}
                              >
                                <Play className="w-4 h-4" />
                                Study
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                onClick={() => router.push(`/study-tools/deck/${item.deck.id}`)}
                              >
                                <Edit className="w-4 h-4" />
                                Manage
                              </Button>
                              <AlertDialog open={deleteDeckId === item.deck.id} onOpenChange={(open) => !open && setDeleteDeckId(null)}>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="gap-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteDeckId(item.deck.id);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Deck</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{item.deck.title}"? All flashcards in this deck will be permanently deleted. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={confirmDeleteDeck}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete Deck
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <Button
                  className="w-full gap-2 h-11 justify-start"
                  onClick={() => setShowCreateDeck(true)}
                >
                  <Plus className="w-4 h-4" />
                  New Deck
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 h-11 justify-start"
                  onClick={() => router.push('/study-tools/plan')}
                >
                  <Calendar className="w-4 h-4" />
                  Study Plan
                </Button>
              </CardContent>
            </Card>

            {/* Study Modes */}
            <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Study Modes
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-3">
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select a deck to start studying</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}