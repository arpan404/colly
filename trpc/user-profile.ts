import { z } from 'zod';
import { protectedProcedure } from './init';
import { TRPCError } from '@trpc/server';
import { 
  userPreferences, 
  users, 
  events, 
  routines, 
  budgets, 
  transactions, 
  wellnessLogs, 
  flashcardDecks, 
  flashcards, 
  studyGoals, 
  studySessions, 
  studySchedules, 
  quizResults, 
  budgetCategories, 
  notifications 
} from '../db/schema';
import { eq, inArray, sql, and, gte } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export const userPreferencesGet = protectedProcedure.query(async ({ ctx }) => {
  const [preferences] = await ctx.db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, ctx.user.id))
    .limit(1);

  if (!preferences) {
    // Create default preferences
    const [defaultPrefs] = await ctx.db
      .insert(userPreferences)
      .values({ userId: ctx.user.id })
      .returning();
    return defaultPrefs;
  }

  return preferences;
});

export const userPreferencesUpdate = protectedProcedure
  .input(z.object({
    // Allow storing user's preference for 'system' as well as light/dark
    theme: z.enum(['light', 'dark', 'system']).optional(),
    currency: z.string().length(3).optional(),
    notifications: z.boolean().optional(),
    emailNotifications: z.boolean().optional(),
    emailWeeklySummary: z.boolean().optional(),
    emailReminders: z.boolean().optional(),
    emailAchievements: z.boolean().optional(),
    fontSize: z.enum(['small', 'medium', 'large']).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const [preferences] = await ctx.db
      .update(userPreferences)
      .set(input)
      .where(eq(userPreferences.userId, ctx.user.id))
      .returning();

    if (preferences) {
      return preferences;
    }

    // If no preferences existed, create them (upsert behaviour)
    const [newPrefs] = await ctx.db
      .insert(userPreferences)
      .values({ userId: ctx.user.id, ...input })
      .returning();
    return newPrefs;
  });

export const userProfileGet = protectedProcedure.query(async ({ ctx }) => {
  const [user] = await ctx.db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatar: users.avatar,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, ctx.user.id))
    .limit(1);

  return user;
});

export const userProfileUpdate = protectedProcedure
  .input(z.object({
    name: z.string().optional(),
    avatar: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const [user] = await ctx.db
      .update(users)
      .set(input)
      .where(eq(users.id, ctx.user.id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        createdAt: users.createdAt,
      });
    return user;
  });

export const userPasswordChange = protectedProcedure
  .input(z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }))
  .mutation(async ({ input, ctx }) => {
    // Get current user with password
    const [user] = await ctx.db
      .select({
        id: users.id,
        password: users.password,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(input.currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(input.newPassword, 10);

    // Update password
    await ctx.db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, ctx.user.id));

    return { success: true };
  });

export const userDataExport = protectedProcedure.query(async ({ ctx }) => {
  // Export all user data
  const userData = {
    profile: await ctx.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1),

    preferences: await ctx.db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, ctx.user.id)),

    events: await ctx.db
      .select()
      .from(events)
      .where(eq(events.userId, ctx.user.id)),

    routines: await ctx.db
      .select()
      .from(routines)
      .where(eq(routines.userId, ctx.user.id)),

    budgets: await ctx.db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, ctx.user.id)),

    transactions: await ctx.db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, ctx.user.id)),

    wellnessLogs: await ctx.db
      .select()
      .from(wellnessLogs)
      .where(eq(wellnessLogs.userId, ctx.user.id)),

    flashcardDecks: await ctx.db
      .select()
      .from(flashcardDecks)
      .where(eq(flashcardDecks.userId, ctx.user.id)),

    flashcards: await ctx.db
      .select()
      .from(flashcards)
      .where(inArray(flashcards.deckId, ctx.db.select({ id: flashcardDecks.id }).from(flashcardDecks).where(eq(flashcardDecks.userId, ctx.user.id)))),

    studyGoals: await ctx.db
      .select()
      .from(studyGoals)
      .where(eq(studyGoals.userId, ctx.user.id)),

    studySessions: await ctx.db
      .select()
      .from(studySessions)
      .where(eq(studySessions.userId, ctx.user.id)),

    studySchedules: await ctx.db
      .select()
      .from(studySchedules)
      .where(eq(studySchedules.userId, ctx.user.id)),
  };

  return userData;
});

export const userDataReset = protectedProcedure
  .input(z.object({
    confirmText: z.string().refine(val => val === 'RESET ALL DATA', {
      message: 'Please type "RESET ALL DATA" to confirm',
    }),
  }))
  .mutation(async ({ input, ctx }) => {
    // Delete all user data in the correct order (respecting foreign keys)
    await ctx.db.delete(studySessions).where(eq(studySessions.userId, ctx.user.id));
    await ctx.db.delete(studySchedules).where(eq(studySchedules.userId, ctx.user.id));
    await ctx.db.delete(studyGoals).where(eq(studyGoals.userId, ctx.user.id));
    await ctx.db.delete(quizResults).where(eq(quizResults.userId, ctx.user.id));
    await ctx.db.delete(flashcards).where(inArray(flashcards.deckId, ctx.db.select({ id: flashcardDecks.id }).from(flashcardDecks).where(eq(flashcardDecks.userId, ctx.user.id))));
    await ctx.db.delete(flashcardDecks).where(eq(flashcardDecks.userId, ctx.user.id));
    await ctx.db.delete(wellnessLogs).where(eq(wellnessLogs.userId, ctx.user.id));
    await ctx.db.delete(transactions).where(eq(transactions.userId, ctx.user.id));
    await ctx.db.delete(budgets).where(eq(budgets.userId, ctx.user.id));
    await ctx.db.delete(budgetCategories).where(eq(budgetCategories.userId, ctx.user.id));
    await ctx.db.delete(routines).where(eq(routines.userId, ctx.user.id));
    await ctx.db.delete(events).where(eq(events.userId, ctx.user.id));
    await ctx.db.delete(notifications).where(eq(notifications.userId, ctx.user.id));
    await ctx.db.delete(userPreferences).where(eq(userPreferences.userId, ctx.user.id));

    return { success: true, message: 'All user data has been reset' };
  });

export const userStatistics = protectedProcedure
  .query(async ({ ctx }) => {
    const user = await ctx.db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    if (!user.length) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

    const userData = user[0];
    const now = new Date();
    const accountAge = Math.floor((now.getTime() - userData.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Account statistics
    const accountStats = {
      accountCreated: userData.createdAt,
      accountAge: accountAge,
      name: userData.name,
      email: userData.email,
    };

    // Events statistics
    const [totalEvents] = await ctx.db.select({ count: sql<number>`count(*)` }).from(events).where(eq(events.userId, ctx.user.id));
    const [upcomingEvents] = await ctx.db.select({ count: sql<number>`count(*)` }).from(events).where(and(eq(events.userId, ctx.user.id), sql`${events.startDate} >= CURRENT_DATE`));
    const [thisMonthEvents] = await ctx.db.select({ count: sql<number>`count(*)` }).from(events).where(and(eq(events.userId, ctx.user.id), eq(sql`EXTRACT(MONTH FROM ${events.startDate})`, now.getMonth() + 1), eq(sql`EXTRACT(YEAR FROM ${events.startDate})`, now.getFullYear())));

    const eventsStats = {
      total: totalEvents.count,
      upcoming: upcomingEvents.count,
      thisMonth: thisMonthEvents.count,
    };

    // Budget/Finance statistics
    const [totalCategories] = await ctx.db.select({ count: sql<number>`count(*)` }).from(budgetCategories).where(eq(budgetCategories.userId, ctx.user.id));
    const [totalTransactions] = await ctx.db.select({ count: sql<number>`count(*)` }).from(transactions).where(eq(transactions.userId, ctx.user.id));
    const [thisMonthTransactions] = await ctx.db.select({ count: sql<number>`count(*)` }).from(transactions).where(and(eq(transactions.userId, ctx.user.id), eq(sql`EXTRACT(MONTH FROM ${transactions.date})`, now.getMonth() + 1), eq(sql`EXTRACT(YEAR FROM ${transactions.date})`, now.getFullYear())));
    const [totalSpent] = await ctx.db.select({ total: sql<number>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)` }).from(transactions).where(and(eq(transactions.userId, ctx.user.id), eq(transactions.type, 'expense'), eq(sql`EXTRACT(MONTH FROM ${transactions.date})`, now.getMonth() + 1), eq(sql`EXTRACT(YEAR FROM ${transactions.date})`, now.getFullYear())));

    const financeStats = {
      categories: totalCategories.count,
      totalTransactions: totalTransactions.count,
      thisMonthTransactions: thisMonthTransactions.count,
      thisMonthSpent: totalSpent.total,
    };

    // Wellness statistics
    const [totalWellnessLogs] = await ctx.db.select({ count: sql<number>`count(*)` }).from(wellnessLogs).where(eq(wellnessLogs.userId, ctx.user.id));
    const [avgMood] = await ctx.db.select({ avg: sql<number>`COALESCE(AVG(${wellnessLogs.mood}), 0)` }).from(wellnessLogs).where(eq(wellnessLogs.userId, ctx.user.id));
    const [avgSleep] = await ctx.db.select({ avg: sql<number>`COALESCE(AVG(${wellnessLogs.sleepHours}), 0)` }).from(wellnessLogs).where(eq(wellnessLogs.userId, ctx.user.id));
    const [avgWater] = await ctx.db.select({ avg: sql<number>`COALESCE(AVG(${wellnessLogs.waterGlasses}), 0)` }).from(wellnessLogs).where(eq(wellnessLogs.userId, ctx.user.id));

    const wellnessStats = {
      totalLogs: totalWellnessLogs.count,
      averageMood: Math.round(avgMood.avg * 10) / 10,
      averageSleep: Math.round(avgSleep.avg * 10) / 10,
      averageWater: Math.round(avgWater.avg * 10) / 10,
    };

    // Study/Flashcard statistics
    const [totalDecks] = await ctx.db.select({ count: sql<number>`count(*)` }).from(flashcardDecks).where(eq(flashcardDecks.userId, ctx.user.id));
    const [totalFlashcards] = await ctx.db.select({ count: sql<number>`count(*)` }).from(flashcards).where(inArray(flashcards.deckId, ctx.db.select({ id: flashcardDecks.id }).from(flashcardDecks).where(eq(flashcardDecks.userId, ctx.user.id))));
    const [totalStudySessions] = await ctx.db.select({ count: sql<number>`count(*)` }).from(studySessions).where(eq(studySessions.userId, ctx.user.id));
    const [totalStudyTime] = await ctx.db.select({ total: sql<number>`COALESCE(SUM(${studySessions.duration}), 0)` }).from(studySessions).where(eq(studySessions.userId, ctx.user.id));
    const [avgQuizScore] = await ctx.db.select({ avg: sql<number>`COALESCE(AVG(${quizResults.score} * 100.0 / ${quizResults.totalQuestions}), 0)` }).from(quizResults).where(eq(quizResults.userId, ctx.user.id));
    const [totalQuizzes] = await ctx.db.select({ count: sql<number>`count(*)` }).from(quizResults).where(eq(quizResults.userId, ctx.user.id));

    const studyStats = {
      decks: totalDecks.count,
      flashcards: totalFlashcards.count,
      studySessions: totalStudySessions.count,
      totalStudyTime: totalStudyTime.total,
      averageQuizScore: Math.round(avgQuizScore.avg * 10) / 10,
      totalQuizzes: totalQuizzes.count,
    };

    // Routines statistics
    const [totalRoutines] = await ctx.db.select({ count: sql<number>`count(*)` }).from(routines).where(eq(routines.userId, ctx.user.id));
    const [activeRoutines] = await ctx.db.select({ count: sql<number>`count(*)` }).from(routines).where(and(eq(routines.userId, ctx.user.id), eq(routines.isRecurring, true)));

    const routinesStats = {
      total: totalRoutines.count,
      active: activeRoutines.count,
    };

    return {
      account: accountStats,
      events: eventsStats,
      finance: financeStats,
      wellness: wellnessStats,
      study: studyStats,
      routines: routinesStats,
    };
  });