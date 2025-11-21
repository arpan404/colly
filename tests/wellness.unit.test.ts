import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
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

describe('Wellness Unit Tests', () => {
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

    describe('wellness.logs.get', () => {
        it('should return wellness logs', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue([
                                { id: 'w1', date: '2024-01-15', mood: 4, sleepHours: '8.00' },
                                { id: 'w2', date: '2024-01-14', mood: 3, sleepHours: '7.00' },
                            ]),
                        }),
                    }),
                }),
            });

            mockDb.select = mockSelect;

            const caller = createAuthCaller();
            const result = await caller.wellness.logs.get({});

            expect(result).toHaveLength(2);
            expect(result[0].mood).toBe(4);
        });
    });

    describe('wellness.logs.create', () => {
        it('should create wellness log', async () => {
            const mockInsert = vi.fn().mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{
                        id: 'log-id',
                        userId: mockUser.id,
                        date: '2024-01-15',
                        mood: 4,
                        sleepHours: '8.00',
                        waterGlasses: 8,
                    }]),
                }),
            });

            mockDb.insert = mockInsert;

            const caller = createAuthCaller();
            const result = await caller.wellness.logs.create({
                date: '2024-01-15',
                mood: 4,
                sleepHours: 8,
                waterGlasses: 8,
            });

            expect(result.mood).toBe(4);
            expect(result.userId).toBe(mockUser.id);
        });
    });

    describe('wellness.logs.update', () => {
        it('should update wellness log', async () => {
            const mockUpdate = vi.fn().mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([{
                            id: 'log-id',
                            mood: 5,
                            sleepHours: '9.00',
                            waterGlasses: 10,
                        }]),
                    }),
                }),
            });

            mockDb.update = mockUpdate;

            const caller = createAuthCaller();
            const result = await caller.wellness.logs.update({
                id: 'log-id',
                mood: 5,
                waterGlasses: 10,
            });

            expect(result.mood).toBe(5);
            expect(result.waterGlasses).toBe(10);
        });
    });
});
