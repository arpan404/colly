import { z } from 'zod';
import { protectedProcedure } from './init';
import { events } from '../db/schema';
import { eq, and, gte, or, isNull } from 'drizzle-orm';

export const eventsGet = protectedProcedure
  .input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    includePublic: z.boolean().default(true),
  }))
  .query(async ({ input, ctx }) => {
    const whereConditions = [];

    if (input.startDate) {
      whereConditions.push(gte(events.startDate, input.startDate));
    }
    if (input.endDate) {
      whereConditions.push(gte(events.endDate || events.startDate, input.endDate));
    }

    const userCondition = eq(events.userId, ctx.user.id);
    const publicCondition = and(eq(events.isPublic, true), isNull(events.userId));

    whereConditions.push(or(userCondition, ...(input.includePublic ? [publicCondition] : [])));

    return await ctx.db
      .select()
      .from(events)
      .where(and(...whereConditions))
      .orderBy(events.startDate, events.startTime);
  });

export const eventCreate = protectedProcedure
  .input(z.object({
    title: z.string(),
    description: z.string().optional(),
    startDate: z.string(),
    startTime: z.string().optional(),
    endDate: z.string().optional(),
    endTime: z.string().optional(),
    location: z.string().optional(),
    category: z.string().optional(),
    isPublic: z.boolean().default(false),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const [event] = await ctx.db
      .insert(events)
      .values({
        ...input,
        startDate: input.startDate,
        endDate: input.endDate,
        latitude: input.latitude?.toString(),
        longitude: input.longitude?.toString(),
        userId: ctx.user.id,
      })
      .returning();
    return event;
  });

export const eventUpdate = protectedProcedure
  .input(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    startDate: z.string().optional(),
    startTime: z.string().optional(),
    endDate: z.string().optional(),
    endTime: z.string().optional(),
    location: z.string().optional(),
    category: z.string().optional(),
    isPublic: z.boolean().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { id, ...updates } = input;
    const updateData = {
      ...updates,
      startDate: updates.startDate,
      endDate: updates.endDate,
      latitude: updates.latitude?.toString(),
      longitude: updates.longitude?.toString(),
    };

    const [event] = await ctx.db
      .update(events)
      .set(updateData)
      .where(and(eq(events.id, id), eq(events.userId, ctx.user.id)))
      .returning();
    return event;
  });

export const eventDelete = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    await ctx.db
      .delete(events)
      .where(and(eq(events.id, input.id), eq(events.userId, ctx.user.id)));
    return { success: true };
  });