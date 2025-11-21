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