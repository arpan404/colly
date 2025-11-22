'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { trpc } from '@/lib/trpc-client';

export default function FlashcardsPage() {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [showDeckForm, setShowDeckForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

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

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeckMutation.mutateAsync(deckForm);
      setShowDeckForm(false);
      setDeckForm({ title: '', description: '', category: '', isPublic: false });
      refetchDecks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeckId) return;
    try {
      await createCardMutation.mutateAsync({ ...cardForm, deckId: selectedDeckId });
      setShowCardForm(false);
      setCardForm({ front: '', back: '', difficulty: 3 });
      refetchCards();
    } catch (err) {
      console.error(err);
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
      setQuizMode(false);
      alert(`Quiz complete! Score: ${newScore.correct}/${newScore.total}`);
    }
  };

  const currentCard = cards && cards.length > 0 ? cards[currentCardIndex] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Flashcards</h1>
          <button
            onClick={() => setShowDeckForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            + New Deck
          </button>
        </div>

        {showDeckForm && (
          <form onSubmit={handleCreateDeck} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create Deck</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={deckForm.title}
                  onChange={(e) => setDeckForm({ ...deckForm, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={deckForm.description}
                  onChange={(e) => setDeckForm({ ...deckForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <input
                  type="text"
                  value={deckForm.category}
                  onChange={(e) => setDeckForm({ ...deckForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={deckForm.isPublic}
                    onChange={(e) => setDeckForm({ ...deckForm, isPublic: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Make this deck public</span>
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeckForm(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Decks</h2>
            {decks && decks.length > 0 ? (
              <div className="space-y-2">
                {decks.map((item: { deck: { id: string; title: string }; cardCount: number }) => (
                  <button
                    key={item.deck.id}
                    onClick={() => {
                      setSelectedDeckId(item.deck.id);
                      setQuizMode(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border ${
                      selectedDeckId === item.deck.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 dark:text-white">{item.deck.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {Number(item.cardCount)} cards
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No decks yet. Create one to get started!</p>
            )}
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            {selectedDeckId ? (
              <>
                {!quizMode ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {decks?.find((d: { deck: { id: string; title: string }; cardCount: number }) => d.deck.id === selectedDeckId)?.deck.title}
                      </h2>
                      <div className="flex gap-2">
                        {cards && cards.length > 0 && (
                          <button
                            onClick={startQuiz}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                          >
                            Start Quiz
                          </button>
                        )}
                        <button
                          onClick={() => setShowCardForm(true)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                        >
                          + Add Card
                        </button>
                      </div>
                    </div>

                    {showCardForm && (
                      <form onSubmit={handleCreateCard} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Add Flashcard</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Front</label>
                            <textarea
                              value={cardForm.front}
                              onChange={(e) => setCardForm({ ...cardForm, front: e.target.value })}
                              required
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Back</label>
                            <textarea
                              value={cardForm.back}
                              onChange={(e) => setCardForm({ ...cardForm, back: e.target.value })}
                              required
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCardForm(false)}
                              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {cards && cards.length > 0 ? (
                      <div className="space-y-3">
                        {cards.map((card: { id: string; front: string; back: string }) => (
                          <div
                            key={card.id}
                            className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg"
                          >
                            <div className="font-semibold text-gray-900 dark:text-white mb-2">{card.front}</div>
                            <div className="text-gray-600 dark:text-gray-400">{card.back}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No cards in this deck yet. Add one to get started!</p>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Card {currentCardIndex + 1} of {cards?.length || 0}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Score: {quizScore.correct}/{quizScore.total}
                      </div>
                    </div>
                    {currentCard && (
                      <div className="border-2 border-indigo-500 p-8 rounded-lg min-h-[300px] flex flex-col justify-center">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
                          {!showAnswer ? currentCard.front : currentCard.back}
                        </div>
                        {!showAnswer ? (
                          <button
                            onClick={() => setShowAnswer(true)}
                            className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                          >
                            Show Answer
                          </button>
                        ) : (
                          <div className="flex gap-4 justify-center mt-4">
                            <button
                              onClick={() => handleQuizAnswer(false)}
                              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                            >
                              Incorrect
                            </button>
                            <button
                              onClick={() => handleQuizAnswer(true)}
                              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                            >
                              Correct
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Select a deck to view cards</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}

