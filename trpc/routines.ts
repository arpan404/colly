import { z } from 'zod';
import { protectedProcedure } from './init';
import { routines } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const routinesGet = protectedProcedure.query(async ({ ctx }) => {
  return await ctx.db
    .select()
    .from(routines)
    .where(eq(routines.userId, ctx.user.id))
    .orderBy(routines.dayOfWeek, routines.startTime);
});

export const routineCreate = protectedProcedure
  .input(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    isRecurring: z.boolean().default(true),
  }))
  .mutation(async ({ input, ctx }) => {
    const [routine] = await ctx.db
      .insert(routines)
      .values({
        ...input,
        userId: ctx.user.id,
      })
      .returning();
    return routine;
  });

export const routineUpdate = protectedProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    dayOfWeek: z.number().min(0).max(6).optional(),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
    isRecurring: z.boolean().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { id, ...updates } = input;
    const [routine] = await ctx.db
      .update(routines)
      .set(updates)
      .where(and(eq(routines.id, id), eq(routines.userId, ctx.user.id)))
      .returning();
    return routine;
  });

export const routineDelete = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    await ctx.db
      .delete(routines)
      .where(and(eq(routines.id, input.id), eq(routines.userId, ctx.user.id)));
    return { success: true };
  });