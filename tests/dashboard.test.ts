import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { appRouter } from '../trpc/router';
import { setupTestDb, cleanupTestDb, createAuthContext, createTestContext } from './setup';
import { testDb } from './setup';
import { users, budgets, budgetCategories, transactions, events, flashcardDecks, flashcards, wellnessLogs } from '../db/schema';

describe('Dashboard Router', () => {
    let userId: string;
    let authContext: any;

    beforeAll(async () => {
        await setupTestDb();
    });

    afterAll(async () => {
        await cleanupTestDb();
    });

    beforeEach(async () => {
        await cleanupTestDb();

        const [user] = await testDb.insert(users).values({
            email: 'test@example.com',
            password: 'hashedpassword',
        }).returning();

        userId = user.id;
        authContext = createAuthContext({ id: userId, email: 'test@example.com' });
    });

    describe('get', () => {
        it('should return dashboard data for authenticated user', async () => {
            const caller = appRouter.createCaller(authContext);
            const result = await caller.dashboard.get();

            expect(result).toHaveProperty('budgetSummary');
            expect(result).toHaveProperty('upcomingEvents');
            expect(result).toHaveProperty('recentFlashcards');
            expect(result).toHaveProperty('wellnessSummary');
            expect(result.budgetSummary).toEqual({ totalBudget: null, totalSpent: null });
        });

        it('should return correct budget summary with data', async () => {
            const [category] = await testDb.insert(budgetCategories).values({
                userId,
                name: 'Food',
                color: '#FF0000',
            }).returning();

            const now = new Date();
            await testDb.insert(budgets).values({
                userId,
                categoryId: category.id,
                amount: '500.00',
                month: now.getMonth() + 1,
                year: now.getFullYear(),
            });

            await testDb.insert(transactions).values({
                userId,
                categoryId: category.id,
                amount: '100.00',
                description: 'Lunch',
                date: now.toISOString().split('T')[0],
                type: 'expense',
            });

            const caller = appRouter.createCaller(authContext);
            const result = await caller.dashboard.get();

            expect(result.budgetSummary.totalBudget).toBe('500.00');
            expect(result.budgetSummary.totalSpent).toBe('100.00');
        });

        it('should return upcoming events', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7);

            await testDb.insert(events).values({
                userId,
                title: 'Test Event',
                description: 'A test event',
                startDate: futureDate.toISOString().split('T')[0],
                startTime: '10:00',
                category: 'personal',
            });

            const caller = appRouter.createCaller(authContext);
            const result = await caller.dashboard.get();

            expect(result.upcomingEvents).toHaveLength(1);
            expect(result.upcomingEvents[0].title).toBe('Test Event');
        });

        it('should throw error for unauthenticated user', async () => {
            const caller = appRouter.createCaller(createTestContext());
            await expect(caller.dashboard.get()).rejects.toThrow('Unauthorized');
        });
    });
});
