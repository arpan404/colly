import { z } from 'zod';
import { protectedProcedure } from './init';
import { wellnessLogs } from '../db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export const wellnessLogsGet = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.number().default(30),
  }))
  .query(async ({ input, ctx }) => {
    const whereConditions = [eq(wellnessLogs.userId, ctx.user.id)];

    if (input.startDate) {
      whereConditions.push(gte(wellnessLogs.date, input.startDate));
    }
    if (input.endDate) {
      whereConditions.push(lte(wellnessLogs.date, input.endDate));
    }

    return await ctx.db
      .select()
      .from(wellnessLogs)
      .where(and(...whereConditions))
      .orderBy(desc(wellnessLogs.date))
      .limit(input.limit);
  });

export const wellnessLogCreate = protectedProcedure
  .input(z.object({
    date: z.string(),
    mood: z.number().min(1).max(5).optional(),
    sleepHours: z.number().min(0).max(24).optional(),
    waterGlasses: z.number().min(0).optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const [log] = await ctx.db
      .insert(wellnessLogs)
      .values({
        ...input,
        date: input.date,
        sleepHours: input.sleepHours?.toString(),
        userId: ctx.user.id,
      })
      .returning();
    return log;
  });

export const wellnessLogUpdate = protectedProcedure
  .input(z.object({
    id: z.string(),
    mood: z.number().min(1).max(5).optional(),
    sleepHours: z.number().min(0).max(24).optional(),
    waterGlasses: z.number().min(0).optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { id, ...updates } = input;
    const [log] = await ctx.db
      .update(wellnessLogs)
      .set({
        ...updates,
        sleepHours: updates.sleepHours?.toString(),
      })
      .where(and(eq(wellnessLogs.id, id), eq(wellnessLogs.userId, ctx.user.id)))
      .returning();
    return log;
  });