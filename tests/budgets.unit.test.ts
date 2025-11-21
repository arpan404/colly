import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('../trpc/init', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../trpc/init')>();
    return {
        ...actual,
        protectedProcedure: actual.publicProcedure.use(async ({ ctx, next }) => {
            return next({
                ctx: {
                    ...ctx,
                    user: { id: 'user-id', email: 'test@example.com' },
                },
            });
        }),
    };
});

const { appRouter } = await import('../trpc/router');
const dbModule = await import('../lib/db');

describe('Budgets Unit Tests', () => {
    const mockDb = vi.mocked(dbModule.db);

    const mockUser = { id: 'user-id', email: 'test@example.com' };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createAuthCaller = () => {
        return appRouter.createCaller({
            db: mockDb as any,
            req: new Request('http://localhost:3000', {
                headers: { Authorization: 'Bearer test-token' },
            }),
        });
    };

    describe('budgets.categories.get', () => {
        it('should return user categories', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([
                        { id: 'cat-1', name: 'Food', userId: mockUser.id },
                        { id: 'cat-2', name: 'Transport', userId: mockUser.id },
                    ]),
                }),
            });

            mockDb.select = mockSelect;

            const caller = createAuthCaller();
            const result = await caller.budgets.categories.get();

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Food');
        });
    });

    describe('budgets.categories.create', () => {
        it('should create new category', async () => {
            const mockInsert = vi.fn().mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{
                        id: 'new-cat-id',
                        name: 'Entertainment',
                        color: '#FF00FF',
                        userId: mockUser.id,
                    }]),
                }),
            });

            mockDb.insert = mockInsert;

            const caller = createAuthCaller();
            const result = await caller.budgets.categories.create({
                name: 'Entertainment',
                color: '#FF00FF',
            });

            expect(result.name).toBe('Entertainment');
            expect(result.userId).toBe(mockUser.id);
        });
    });

    describe('budgets.get', () => {
        it('should return budgets with spent amounts', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    innerJoin: vi.fn().mockReturnValue({
                        leftJoin: vi.fn().mockReturnValue({
                            where: vi.fn().mockReturnValue({
                                groupBy: vi.fn().mockResolvedValue([{
                                    budget: { id: 'budget-1', amount: '500.00', categoryId: 'cat-1' },
                                    category: { id: 'cat-1', name: 'Food' },
                                    spent: '150.00',
                                }]),
                            }),
                        }),
                    }),
                }),
            });

            mockDb.select = mockSelect;

            const caller = createAuthCaller();
            const result = await caller.budgets.get({ month: 1, year: 2024 });

            expect(result).toHaveLength(1);
            expect(result[0].budget.amount).toBe('500.00');
        });
    });

    describe('budgets.create', () => {
        it('should create new budget', async () => {
            const mockInsert = vi.fn().mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{
                        id: 'budget-id',
                        categoryId: 'cat-1',
                        amount: '500.00',
                        month: 1,
                        year: 2024,
                        userId: mockUser.id,
                    }]),
                }),
            });

            mockDb.insert = mockInsert;

            const caller = createAuthCaller();
            const result = await caller.budgets.create({
                categoryId: 'cat-1',
                amount: 500,
                month: 1,
                year: 2024,
            });

            expect(result.amount).toBe('500.00');
            expect(result.userId).toBe(mockUser.id);
        });
    });

    describe('budgets.transactions.get', () => {
        it('should return user transactions', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    innerJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            orderBy: vi.fn().mockReturnValue({
                                limit: vi.fn().mockReturnValue({
                                    offset: vi.fn().mockResolvedValue([{
                                        transaction: { id: 'tx-1', amount: '25.50', description: 'Lunch' },
                                        category: { id: 'cat-1', name: 'Food' },
                                    }]),
                                }),
                            }),
                        }),
                    }),
                }),
            });

            mockDb.select = mockSelect;

            const caller = createAuthCaller();
            const result = await caller.budgets.transactions.get({});

            expect(result).toHaveLength(1);
            expect(result[0].transaction.amount).toBe('25.50');
        });
    });

    describe('budgets.transactions.create', () => {
        it('should create new transaction', async () => {
            const mockInsert = vi.fn().mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{
                        id: 'tx-id',
                        categoryId: 'cat-1',
                        amount: '25.50',
                        description: 'Lunch',
                        date: '2024-01-15',
                        type: 'expense',
                        userId: mockUser.id,
                    }]),
                }),
            });

            mockDb.insert = mockInsert;

            const caller = createAuthCaller();
            const result = await caller.budgets.transactions.create({
                categoryId: 'cat-1',
                amount: 25.50,
                description: 'Lunch',
                date: '2024-01-15',
                type: 'expense',
            });

            expect(result.amount).toBe('25.50');
            expect(result.userId).toBe(mockUser.id);
        });
    });
});
