import { protectedProcedure } from './init';
import { notifications } from '../db/schema';
import { desc, eq, and, lt, gte } from 'drizzle-orm';
import { z } from 'zod';

export const notificationsRouter = {
  // Get all notifications for the user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const userNotifications = await ctx.db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        // Don't show expired notifications
        gte(notifications.expiresAt, new Date())
      ))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return userNotifications;
  }),

  // Get unread notifications count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const result = await ctx.db
      .select({ count: notifications.id })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false),
        gte(notifications.expiresAt, new Date())
      ));

    return result.length;
  }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      await ctx.db
        .update(notifications)
        .set({ isRead: true, updatedAt: new Date() })
        .where(and(
          eq(notifications.id, input.id),
          eq(notifications.userId, userId)
        ));

      return { success: true };
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    await ctx.db
      .update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(notifications.userId, userId));

    return { success: true };
  }),

  // Create a notification (internal use)
  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      message: z.string(),
      type: z.enum(['info', 'warning', 'success', 'error']).default('info'),
      actionUrl: z.string().optional(),
      actionText: z.string().optional(),
      expiresAt: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const result = await ctx.db
        .insert(notifications)
        .values({
          userId,
          title: input.title,
          message: input.message,
          type: input.type,
          actionUrl: input.actionUrl,
          actionText: input.actionText,
          expiresAt: input.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        })
        .returning();

      return result[0];
    }),

  // Delete a notification
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      await ctx.db
        .delete(notifications)
        .where(and(
          eq(notifications.id, input.id),
          eq(notifications.userId, userId)
        ));

      return { success: true };
    }),

  // Clean up expired notifications
  cleanup: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .delete(notifications)
      .where(lt(notifications.expiresAt, new Date()));

    return { success: true };
  }),
};