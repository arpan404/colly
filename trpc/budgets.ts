import { z } from 'zod';
import { protectedProcedure } from './init';
import { budgets, budgetCategories, transactions } from '../db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

export const budgetCategoriesGet = protectedProcedure.query(async ({ ctx }) => {
  return await ctx.db
    .select()
    .from(budgetCategories)
    .where(eq(budgetCategories.userId, ctx.user.id));
});

export const budgetCategoryCreate = protectedProcedure
  .input(z.object({
    name: z.string(),
    color: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const [category] = await ctx.db
      .insert(budgetCategories)
      .values({
        ...input,
        userId: ctx.user.id,
      })
      .returning();
    return category;
  });

export const budgetsGet = protectedProcedure
  .input(z.object({
    month: z.number(),
    year: z.number(),
  }))
  .query(async ({ input, ctx }) => {
    return await ctx.db
      .select({
        budget: budgets,
        category: budgetCategories,
        spent: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
      })
      .from(budgets)
      .innerJoin(budgetCategories, eq(budgets.categoryId, budgetCategories.id))
      .leftJoin(transactions, and(
        eq(transactions.categoryId, budgets.categoryId),
        eq(transactions.userId, ctx.user.id),
        eq(transactions.type, 'expense'),
        gte(transactions.date, new Date(input.year, input.month - 1, 1).toISOString().split('T')[0]),
        lte(transactions.date, new Date(input.year, input.month, 0).toISOString().split('T')[0])
      ))
      .where(and(
        eq(budgets.userId, ctx.user.id),
        eq(budgets.month, input.month),
        eq(budgets.year, input.year)
      ))
      .groupBy(budgets.id, budgetCategories.id);
  });

export const budgetCreate = protectedProcedure
  .input(z.object({
    categoryId: z.string(),
    amount: z.number(),
    month: z.number(),
    year: z.number(),
  }))
  .mutation(async ({ input, ctx }) => {
    const [budget] = await ctx.db
      .insert(budgets)
      .values({
        ...input,
        amount: input.amount.toString(),
        userId: ctx.user.id,
      })
      .returning();
    return budget;
  });

export const transactionsGet = protectedProcedure
  .input(z.object({
    limit: z.number().default(50),
    offset: z.number().default(0),
  }))
  .query(async ({ input, ctx }) => {
    return await ctx.db
      .select({
        transaction: transactions,
        category: budgetCategories,
      })
      .from(transactions)
      .innerJoin(budgetCategories, eq(transactions.categoryId, budgetCategories.id))
      .where(eq(transactions.userId, ctx.user.id))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(input.limit)
      .offset(input.offset);
  });

export const transactionCreate = protectedProcedure
  .input(z.object({
    categoryId: z.string(),
    amount: z.number(),
    description: z.string().optional(),
    date: z.string(),
    type: z.enum(['expense', 'income']).default('expense'),
  }))
  .mutation(async ({ input, ctx }) => {
    const [transaction] = await ctx.db
      .insert(transactions)
      .values({
        ...input,
        amount: input.amount.toString(),
        date: input.date,
        userId: ctx.user.id,
      })
      .returning();
    return transaction;
  });