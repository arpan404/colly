import { z } from 'zod';
import { protectedProcedure, publicProcedure } from './init';
import { flashcardDecks, flashcards, quizResults } from '../db/schema';
import { eq, and, or, isNull, desc, sql } from 'drizzle-orm';

export const flashcardDecksGet = protectedProcedure.query(async ({ ctx }) => {
  return await ctx.db
    .select({
      deck: flashcardDecks,
      cardCount: sql<number>`count(${flashcards.id})`,
    })
    .from(flashcardDecks)
    .leftJoin(flashcards, eq(flashcardDecks.id, flashcards.deckId))
    .where(or(
      eq(flashcardDecks.userId, ctx.user.id),
      and(eq(flashcardDecks.isPublic, true), isNull(flashcardDecks.userId))
    ))
    .groupBy(flashcardDecks.id)
    .orderBy(desc(flashcardDecks.createdAt));
});

export const flashcardDeckCreate = protectedProcedure
  .input(z.object({
    title: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    isPublic: z.boolean().default(false),
  }))
  .mutation(async ({ input, ctx }) => {
    const [deck] = await ctx.db
      .insert(flashcardDecks)
      .values({
        ...input,
        userId: ctx.user.id,
      })
      .returning();
    return deck;
  });

export const flashcardsGet = protectedProcedure
  .input(z.object({ deckId: z.string() }))
  .query(async ({ input, ctx }) => {
    const [deck] = await ctx.db
      .select()
      .from(flashcardDecks)
      .where(eq(flashcardDecks.id, input.deckId))
      .limit(1);

    if (!deck || (deck.userId !== ctx.user.id && !deck.isPublic)) {
      throw new Error('Deck not found or access denied');
    }

    return await ctx.db
      .select()
      .from(flashcards)
      .where(eq(flashcards.deckId, input.deckId))
      .orderBy(flashcards.createdAt);
  });

export const flashcardCreate = protectedProcedure
  .input(z.object({
    deckId: z.string(),
    front: z.string(),
    back: z.string(),
    difficulty: z.number().min(1).max(5).default(3),
  }))
  .mutation(async ({ input, ctx }) => {
    const [deck] = await ctx.db
      .select()
      .from(flashcardDecks)
      .where(and(eq(flashcardDecks.id, input.deckId), eq(flashcardDecks.userId, ctx.user.id)))
      .limit(1);

    if (!deck) {
      throw new Error('Deck not found');
    }

    const [flashcard] = await ctx.db
      .insert(flashcards)
      .values(input)
      .returning();
    return flashcard;
  });

export const flashcardUpdate = protectedProcedure
  .input(z.object({
    id: z.string(),
    front: z.string().optional(),
    back: z.string().optional(),
    difficulty: z.number().min(1).max(5).optional(),
    lastReviewed: z.string().optional(),
    nextReview: z.string().optional(),
    reviewCount: z.number().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { id, ...updates } = input;
    const updateData = {
      ...updates,
      lastReviewed: updates.lastReviewed ? new Date(updates.lastReviewed) : undefined,
      nextReview: updates.nextReview ? new Date(updates.nextReview) : undefined,
    };

    const [flashcard] = await ctx.db
      .update(flashcards)
      .set(updateData)
      .where(eq(flashcards.id, id))
      .returning();

    // Check if user owns the deck
    const [deck] = await ctx.db
      .select()
      .from(flashcardDecks)
      .where(eq(flashcardDecks.id, flashcard.deckId))
      .limit(1);

    if (deck.userId !== ctx.user.id) {
      throw new Error('Access denied');
    }

    return flashcard;
  });

export const flashcardDelete = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // First check if the flashcard exists and user owns the deck
    const [flashcard] = await ctx.db
      .select()
      .from(flashcards)
      .where(eq(flashcards.id, input.id))
      .limit(1);

    if (!flashcard) {
      throw new Error('Flashcard not found');
    }

    const [deck] = await ctx.db
      .select()
      .from(flashcardDecks)
      .where(eq(flashcardDecks.id, flashcard.deckId))
      .limit(1);

    if (deck.userId !== ctx.user.id) {
      throw new Error('Access denied');
    }

    await ctx.db
      .delete(flashcards)
      .where(eq(flashcards.id, input.id));

    return { success: true };
  });

export const flashcardDeckDelete = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const [deck] = await ctx.db
      .select()
      .from(flashcardDecks)
      .where(and(eq(flashcardDecks.id, input.id), eq(flashcardDecks.userId, ctx.user.id)))
      .limit(1);

    if (!deck) {
      throw new Error('Deck not found');
    }

    // Delete all flashcards in the deck first
    await ctx.db
      .delete(flashcards)
      .where(eq(flashcards.deckId, input.id));

    // Delete the deck
    await ctx.db
      .delete(flashcardDecks)
      .where(eq(flashcardDecks.id, input.id));

    return { success: true };
  });

export const flashcardDeckGet = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const [deck] = await ctx.db
      .select()
      .from(flashcardDecks)
      .where(and(eq(flashcardDecks.id, input.id), eq(flashcardDecks.userId, ctx.user.id)))
      .limit(1);

    if (!deck) {
      throw new Error('Deck not found');
    }

    return deck;
  });

export const quizResultCreate = protectedProcedure
  .input(z.object({
    deckId: z.string(),
    score: z.number(),
    totalQuestions: z.number(),
    timeSpent: z.number().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const [result] = await ctx.db
      .insert(quizResults)
      .values({
        ...input,
        userId: ctx.user.id,
      })
      .returning();
    return result;
  });

// Overall study statistics for the current user
export const flashcardsStatsGet = protectedProcedure.query(async ({ ctx }) => {
  // Total decks owned by user
  const [deckCountRow] = await ctx.db
    .select({ totalDecks: sql<number>`count(${flashcardDecks.id})` })
    .from(flashcardDecks)
    .where(eq(flashcardDecks.userId, ctx.user.id));

  // Total cards reviewed (sum of reviewCount across user's decks)
  const [cardsReviewedRow] = await ctx.db
    .select({ cardsReviewed: sql<number>`coalesce(sum(${flashcards.reviewCount}), 0)` })
    .from(flashcardDecks)
    .leftJoin(flashcards, eq(flashcardDecks.id, flashcards.deckId))
    .where(eq(flashcardDecks.userId, ctx.user.id));

  // Quiz aggregates
  const [quizTotals] = await ctx.db
    .select({ quizCount: sql<number>`count(${quizResults.id})`, totalScore: sql<number>`coalesce(sum(${quizResults.score}), 0)`, totalQuestions: sql<number>`coalesce(sum(${quizResults.totalQuestions}), 0)` })
    .from(quizResults)
    .where(eq(quizResults.userId, ctx.user.id));

  // Per-deck aggregated results (used to compute decksMastered)
  const perDeck = await ctx.db
    .select({ deckId: quizResults.deckId, scored: sql<number>`coalesce(sum(${quizResults.score}),0)`, asked: sql<number>`coalesce(sum(${quizResults.totalQuestions}),0)` })
    .from(quizResults)
    .where(eq(quizResults.userId, ctx.user.id))
    .groupBy(quizResults.deckId as any);

  const decksMastered = perDeck.filter((r: any) => r.asked > 0 && (r.scored / r.asked) >= 0.8).length;

  const overallMasteryPercent = quizTotals.totalQuestions > 0 ? (quizTotals.totalScore / quizTotals.totalQuestions) * 100 : 0;

  return {
    totalDecks: Number(deckCountRow?.totalDecks ?? 0),
    decksMastered: Number(decksMastered ?? 0),
    cardsReviewed: Number(cardsReviewedRow?.cardsReviewed ?? 0),
    quizCount: Number(quizTotals?.quizCount ?? 0),
    overallMasteryPercent: Number(Number(overallMasteryPercent).toFixed(2)),
  };
});

// Per-deck statistics
export const flashcardDeckStatsGet = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    // Verify deck ownership
    const [deck] = await ctx.db
      .select()
      .from(flashcardDecks)
      .where(eq(flashcardDecks.id, input.id))
      .limit(1);

    if (!deck || deck.userId !== ctx.user.id) {
      throw new Error('Deck not found or access denied');
    }

    // Card counts / reviewed
    const [cardsRow] = await ctx.db
      .select({ cardCount: sql<number>`count(${flashcards.id})`, cardsReviewed: sql<number>`coalesce(sum(${flashcards.reviewCount}),0)` })
      .from(flashcards)
      .where(eq(flashcards.deckId, input.id));

    // Quiz aggregates for this deck
    const [quizRow] = await ctx.db
      .select({ quizCount: sql<number>`count(${quizResults.id})`, totalScore: sql<number>`coalesce(sum(${quizResults.score}),0)`, totalQuestions: sql<number>`coalesce(sum(${quizResults.totalQuestions}),0)`, lastCompleted: sql<string>`max(${quizResults.completedAt})` })
      .from(quizResults)
      .where(and(eq(quizResults.deckId, input.id), eq(quizResults.userId, ctx.user.id)));

    const averageScore = quizRow.totalQuestions > 0 ? (quizRow.totalScore / quizRow.totalQuestions) * 100 : 0;

    return {
      cardCount: Number(cardsRow?.cardCount ?? 0),
      cardsReviewed: Number(cardsRow?.cardsReviewed ?? 0),
      quizCount: Number(quizRow?.quizCount ?? 0),
      averageScore: Number(Number(averageScore).toFixed(2)),
      lastCompletedAt: quizRow?.lastCompleted ?? null,
    };
  });