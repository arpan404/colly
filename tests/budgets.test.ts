import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { appRouter } from '../trpc/router';
import { setupTestDb, cleanupTestDb, createAuthContext, createTestContext } from './setup';
import { testDb } from './setup';
import { users, budgetCategories, budgets, transactions } from '../db/schema';

describe('Budgets Router', () => {
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

    describe('categories', () => {
        describe('get', () => {
            it('should return empty array when no categories exist', async () => {
                const caller = appRouter.createCaller(authContext);
                const result = await caller.budgets.categories.get();
                expect(result).toEqual([]);
            });

            it('should return user budget categories', async () => {
                await testDb.insert(budgetCategories).values([
                    { userId, name: 'Food', color: '#FF0000' },
                    { userId, name: 'Transportation', color: '#00FF00' },
                ]);

                const caller = appRouter.createCaller(authContext);
                const result = await caller.budgets.categories.get();

                expect(result).toHaveLength(2);
                expect(result[0].name).toBe('Food');
            });

            it('should not return categories from other users', async () => {
                const [otherUser] = await testDb.insert(users).values({
                    email: 'other@example.com',
                    password: 'hashedpassword',
                }).returning();

                await testDb.insert(budgetCategories).values({
                    userId: otherUser.id,
                    name: 'Other Category',
                });

                const caller = appRouter.createCaller(authContext);
                const result = await caller.budgets.categories.get();
                expect(result).toHaveLength(0);
            });

            it('should throw error for unauthenticated user', async () => {
                const caller = appRouter.createCaller(createTestContext());
                await expect(caller.budgets.categories.get()).rejects.toThrow('Unauthorized');
            });
        });

        describe('create', () => {
            it('should create a new budget category', async () => {
                const caller = appRouter.createCaller(authContext);
                const result = await caller.budgets.categories.create({
                    name: 'Entertainment',
                    color: '#FF00FF',
                });

                expect(result).toHaveProperty('id');
                expect(result.name).toBe('Entertainment');
                expect(result.userId).toBe(userId);
            });

            it('should create category without color', async () => {
                const caller = appRouter.createCaller(authContext);
                const result = await caller.budgets.categories.create({ name: 'Utilities' });
                expect(result.color).toBeNull();
            });

            it('should throw error for unauthenticated user', async () => {
                const caller = appRouter.createCaller(createTestContext());
                await expect(caller.budgets.categories.create({ name: 'Test' })).rejects.toThrow('Unauthorized');
            });
        });
    });

    describe('get', () => {
        it('should return empty array when no budgets exist', async () => {
            const caller = appRouter.createCaller(authContext);
            const result = await caller.budgets.get({ month: 1, year: 2024 });
            expect(result).toEqual([]);
        });

        it('should return budgets with spent amounts', async () => {
            const [category] = await testDb.insert(budgetCategories).values({
                userId,
                name: 'Food',
            }).returning();

            await testDb.insert(budgets).values({
                userId,
                categoryId: category.id,
                amount: '500.00',
                month: 1,
                year: 2024,
            });

            await testDb.insert(transactions).values([
                { userId, categoryId: category.id, amount: '100.00', description: 'Lunch', date: '2024-01-15', type: 'expense' },
                { userId, categoryId: category.id, amount: '50.00', description: 'Coffee', date: '2024-01-20', type: 'expense' },
            ]);

            const caller = appRouter.createCaller(authContext);
            const result = await caller.budgets.get({ month: 1, year: 2024 });

            expect(result).toHaveLength(1);
            expect(result[0].budget.amount).toBe('500.00');
            expect(result[0].spent).toBe('150.00');
        });

        it('should throw error for unauthenticated user', async () => {
            const caller = appRouter.createCaller(createTestContext());
            await expect(caller.budgets.get({ month: 1, year: 2024 })).rejects.toThrow('Unauthorized');
        });
    });

    describe('create', () => {
        let categoryId: string;

        beforeEach(async () => {
            const [category] = await testDb.insert(budgetCategories).values({
                userId,
                name: 'Food',
            }).returning();
            categoryId = category.id;
        });

        it('should create a new budget', async () => {
            const caller = appRouter.createCaller(authContext);
            const result = await caller.budgets.create({
                categoryId,
                amount: 500,
                month: 1,
                year: 2024,
            });

            expect(result).toHaveProperty('id');
            expect(result.amount).toBe('500.00');
            expect(result.userId).toBe(userId);
        });

        it('should throw error for unauthenticated user', async () => {
            const caller = appRouter.createCaller(createTestContext());
            await expect(caller.budgets.create({ categoryId, amount: 500, month: 1, year: 2024 })).rejects.toThrow('Unauthorized');
        });
    });

    describe('transactions', () => {
        describe('get', () => {
            it('should return empty array when no transactions exist', async () => {
                const caller = appRouter.createCaller(authContext);
                const result = await caller.budgets.transactions.get({});
                expect(result).toEqual([]);
            });

            it('should return user transactions with categories', async () => {
                const [category] = await testDb.insert(budgetCategories).values({
                    userId,
                    name: 'Food',
                }).returning();

                await testDb.insert(transactions).values([
                    { userId, categoryId: category.id, amount: '25.50', description: 'Lunch', date: '2024-01-15', type: 'expense' },
                    { userId, categoryId: category.id, amount: '1000.00', description: 'Salary', date: '2024-01-01', type: 'income' },
                ]);

                const caller = appRouter.createCaller(authContext);
                const result = await caller.budgets.transactions.get({});

                expect(result).toHaveLength(2);
                expect(result[0].category.name).toBe('Food');
            });

            it('should throw error for unauthenticated user', async () => {
                const caller = appRouter.createCaller(createTestContext());
                await expect(caller.budgets.transactions.get({})).rejects.toThrow('Unauthorized');
            });
        });

        describe('create', () => {
            let categoryId: string;

            beforeEach(async () => {
                const [category] = await testDb.insert(budgetCategories).values({
                    userId,
                    name: 'Food',
                }).returning();
                categoryId = category.id;
            });

            it('should create a new transaction', async () => {
                const caller = appRouter.createCaller(authContext);
                const result = await caller.budgets.transactions.create({
                    categoryId,
                    amount: 25.50,
                    description: 'Lunch',
                    date: '2024-01-15',
                    type: 'expense',
                });

                expect(result).toHaveProperty('id');
                expect(result.amount).toBe('25.50');
                expect(result.userId).toBe(userId);
            });

            it('should throw error for unauthenticated user', async () => {
                const caller = appRouter.createCaller(createTestContext());
                await expect(caller.budgets.transactions.create({ categoryId, amount: 100, date: '2024-01-15' })).rejects.toThrow('Unauthorized');
            });
        });
    });
});
