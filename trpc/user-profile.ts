import { z } from 'zod';
import { protectedProcedure } from './init';
import { userPreferences, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';

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
    theme: z.enum(['light', 'dark']).optional(),
    currency: z.string().length(3).optional(),
    notifications: z.boolean().optional(),
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
        createdAt: users.createdAt,
      });
    return user;
  });