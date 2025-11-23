import { z } from 'zod';
import { protectedProcedure } from './init';
import { studyGoals, studySessions, studySchedules } from '../db/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';

type StudyGoal = typeof studyGoals.$inferSelect;

// Study Goals CRUD
export const studyGoalsGet = protectedProcedure.query(async ({ ctx }) => {
  return await ctx.db
    .select()
    .from(studyGoals)
    .where(eq(studyGoals.userId, ctx.user.id))
    .orderBy(desc(studyGoals.createdAt));
});

export const studyGoalCreate = protectedProcedure
  .input(z.object({
    title: z.string(),
    description: z.string().optional(),
    type: z.enum(['daily', 'weekly', 'monthly']),
    targetValue: z.number().min(1),
    targetUnit: z.enum(['cards', 'minutes', 'sessions']),
    deadline: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const goalData = {
      ...input,
      userId: ctx.user.id,
    };

    if (input.deadline) {
      goalData.deadline = input.deadline;
    }

    const [goal] = await ctx.db
      .insert(studyGoals)
      .values(goalData)
      .returning();
    return goal;
  });

export const studyGoalUpdate = protectedProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    targetValue: z.number().min(1).optional(),
    targetUnit: z.string().optional(),
    currentValue: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
    deadline: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { id, ...updates } = input;
    const updateData = {
      ...updates,
      deadline: updates.deadline,
    };

    const [goal] = await ctx.db
      .update(studyGoals)
      .set(updateData)
      .where(and(eq(studyGoals.id, id), eq(studyGoals.userId, ctx.user.id)))
      .returning();

    if (!goal) {
      throw new Error('Study goal not found');
    }

    return goal;
  });

export const studyGoalDelete = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const [goal] = await ctx.db
      .delete(studyGoals)
      .where(and(eq(studyGoals.id, input.id), eq(studyGoals.userId, ctx.user.id)))
      .returning();

    if (!goal) {
      throw new Error('Study goal not found');
    }

    return { success: true };
  });

// Study Sessions CRUD
export const studySessionsGet = protectedProcedure
  .input(z.object({
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).default(0),
  }))
  .query(async ({ input, ctx }) => {
    return await ctx.db
      .select()
      .from(studySessions)
      .where(eq(studySessions.userId, ctx.user.id))
      .orderBy(desc(studySessions.startedAt))
      .limit(input.limit)
      .offset(input.offset);
  });

export const studySessionCreate = protectedProcedure
  .input(z.object({
    deckId: z.string().optional(),
    duration: z.number().min(1),
    cardsReviewed: z.number().min(0).default(0),
    sessionType: z.enum(['flashcards', 'quiz']).default('flashcards'),
  }))
  .mutation(async ({ input, ctx }) => {
    const [session] = await ctx.db
      .insert(studySessions)
      .values({
        ...input,
        userId: ctx.user.id,
        completedAt: new Date(),
      })
      .returning();
    return session;
  });

// Study Schedules CRUD
export const studySchedulesGet = protectedProcedure.query(async ({ ctx }) => {
  return await ctx.db
    .select()
    .from(studySchedules)
    .where(eq(studySchedules.userId, ctx.user.id))
    .orderBy(studySchedules.dayOfWeek, studySchedules.startTime);
});

export const studyScheduleCreate = protectedProcedure
  .input(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    const [schedule] = await ctx.db
      .insert(studySchedules)
      .values({
        ...input,
        userId: ctx.user.id,
      })
      .returning();
    return schedule;
  });

export const studyScheduleUpdate = protectedProcedure
  .input(z.object({
    id: z.string(),
    dayOfWeek: z.number().min(0).max(6).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    isActive: z.boolean().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { id, ...updates } = input;

    const [schedule] = await ctx.db
      .update(studySchedules)
      .set(updates)
      .where(and(eq(studySchedules.id, id), eq(studySchedules.userId, ctx.user.id)))
      .returning();

    if (!schedule) {
      throw new Error('Study schedule not found');
    }

    return schedule;
  });

export const studyScheduleDelete = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const [schedule] = await ctx.db
      .delete(studySchedules)
      .where(and(eq(studySchedules.id, input.id), eq(studySchedules.userId, ctx.user.id)))
      .returning();

    if (!schedule) {
      throw new Error('Study schedule not found');
    }

    return { success: true };
  });

// Study Plan Statistics
export const studyPlanStatsGet = protectedProcedure.query(async ({ ctx }) => {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  // Daily stats
  const [dailyStats] = await ctx.db
    .select({
      totalMinutes: sql<number>`coalesce(sum(${studySessions.duration}), 0)`,
      totalCards: sql<number>`coalesce(sum(${studySessions.cardsReviewed}), 0)`,
      sessionCount: sql<number>`count(${studySessions.id})`,
    })
    .from(studySessions)
    .where(and(
      eq(studySessions.userId, ctx.user.id),
      gte(studySessions.startedAt, dayStart),
      lte(studySessions.startedAt, dayEnd)
    ));

  // Weekly stats
  const [weeklyStats] = await ctx.db
    .select({
      totalMinutes: sql<number>`coalesce(sum(${studySessions.duration}), 0)`,
      totalCards: sql<number>`coalesce(sum(${studySessions.cardsReviewed}), 0)`,
      sessionCount: sql<number>`count(${studySessions.id})`,
    })
    .from(studySessions)
    .where(and(
      eq(studySessions.userId, ctx.user.id),
      gte(studySessions.startedAt, weekStart),
      lte(studySessions.startedAt, weekEnd)
    ));

  // Active goals
  const activeGoals = await ctx.db
    .select()
    .from(studyGoals)
    .where(and(
      eq(studyGoals.userId, ctx.user.id),
      eq(studyGoals.isActive, true)
    ));

  // Calculate goal progress
  const goalProgress = activeGoals.map((goal: StudyGoal) => {
    const progressPercent = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
    return {
      ...goal,
      progressPercent: Math.min(progressPercent, 100),
      isCompleted: goal.currentValue >= goal.targetValue,
    };
  });

  return {
    daily: {
      totalMinutes: Number(dailyStats?.totalMinutes ?? 0),
      totalCards: Number(dailyStats?.totalCards ?? 0),
      sessionCount: Number(dailyStats?.sessionCount ?? 0),
    },
    weekly: {
      totalMinutes: Number(weeklyStats?.totalMinutes ?? 0),
      totalCards: Number(weeklyStats?.totalCards ?? 0),
      sessionCount: Number(weeklyStats?.sessionCount ?? 0),
    },
    goals: goalProgress,
  };
});