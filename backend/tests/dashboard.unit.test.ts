import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/db', () => ({
    db: {
        select: vi.fn(),
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

describe('Dashboard Unit Tests', () => {
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

    describe('dashboard.get', () => {
        it('should return dashboard data', async () => {
            const mockSelect = vi.fn()
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        leftJoin: vi.fn().mockReturnValue({
                            where: vi.fn().mockResolvedValue([{
                                totalBudget: null,
                                totalSpent: null,
                            }]),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            orderBy: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue([]),
                            }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        innerJoin: vi.fn().mockReturnValue({
                            where: vi.fn().mockReturnValue({
                                orderBy: vi.fn().mockReturnValue({
                                    limit: vi.fn().mockResolvedValue([]),
                                }),
                            }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            orderBy: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue([]),
                            }),
                        }),
                    }),
                });

            mockDb.select = mockSelect;

            const caller = createAuthCaller();
            const result = await caller.dashboard.get();

            expect(result).toHaveProperty('budgetSummary');
            expect(result).toHaveProperty('upcomingEvents');
            expect(result).toHaveProperty('recentFlashcards');
            expect(result).toHaveProperty('wellnessSummary');
        });

        it('should return budget summary with data', async () => {
            const mockSelect = vi.fn()
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        leftJoin: vi.fn().mockReturnValue({
                            where: vi.fn().mockResolvedValue([{
                                totalBudget: '500.00',
                                totalSpent: '150.00',
                            }]),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            orderBy: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue([]),
                            }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        innerJoin: vi.fn().mockReturnValue({
                            where: vi.fn().mockReturnValue({
                                orderBy: vi.fn().mockReturnValue({
                                    limit: vi.fn().mockResolvedValue([]),
                                }),
                            }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            orderBy: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue([]),
                            }),
                        }),
                    }),
                });

            mockDb.select = mockSelect;

            const caller = createAuthCaller();
            const result = await caller.dashboard.get();

            expect(result.budgetSummary.totalBudget).toBe('500.00');
            expect(result.budgetSummary.totalSpent).toBe('150.00');
        });
    });
});
