import { protectedProcedure } from './init';
import { wellnessLogs, transactions, budgets, events, flashcards, flashcardDecks } from '../db/schema';
import { gte, lte, desc, sql, and, eq } from 'drizzle-orm';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

export const dashboardGet = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user.id;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  // Get budget summary
  const budgetSummary = await ctx.db
    .select({
      totalBudget: sql<number>`sum(${budgets.amount})`,
      totalSpent: sql<number>`sum(${transactions.amount})`,
    })
    .from(budgets)
    .leftJoin(transactions, and(
      eq(budgets.categoryId, transactions.categoryId),
      eq(transactions.userId, userId),
      gte(transactions.date, monthStart.toISOString().split('T')[0]),
      lte(transactions.date, monthEnd.toISOString().split('T')[0])
    ))
    .where(and(
      eq(budgets.userId, userId),
      eq(budgets.month, now.getMonth() + 1),
      eq(budgets.year, now.getFullYear())
    ));

  // Get upcoming events
  const upcomingEvents = await ctx.db
    .select()
    .from(events)
    .where(and(
      eq(events.userId, userId),
      gte(events.startDate, now.toISOString().split('T')[0])
    ))
    .orderBy(events.startDate)
    .limit(5);

  // Get recent flashcards
  const recentFlashcards = await ctx.db
    .select({
      id: flashcards.id,
      front: flashcards.front,
      deckTitle: flashcardDecks.title,
    })
    .from(flashcards)
    .innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
    .where(eq(flashcardDecks.userId, userId))
    .orderBy(desc(flashcards.createdAt))
    .limit(5);

  // Get wellness summary
  const wellnessSummary = await ctx.db
    .select()
    .from(wellnessLogs)
    .where(and(
      eq(wellnessLogs.userId, userId),
      gte(wellnessLogs.date, weekStart.toISOString().split('T')[0]),
      lte(wellnessLogs.date, weekEnd.toISOString().split('T')[0])
    ))
    .orderBy(desc(wellnessLogs.date))
    .limit(7);

  return {
    budgetSummary: budgetSummary[0] || { totalBudget: 0, totalSpent: 0 },
    upcomingEvents,
    recentFlashcards,
    wellnessSummary,
  };
});