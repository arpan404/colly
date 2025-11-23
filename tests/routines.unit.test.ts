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

describe('Routines Unit Tests', () => {
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

    describe('routines.get', () => {
        it('should return user routines', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockResolvedValue([
                            { id: 'r1', title: 'Morning Workout', dayOfWeek: 1, startTime: '07:00' },
                            { id: 'r2', title: 'Evening Reading', dayOfWeek: 1, startTime: '20:00' },
                        ]),
                    }),
                }),
            });

            mockDb.select = mockSelect;

            const caller = createAuthCaller();
            const result = await caller.routines.get();

            expect(result).toHaveLength(2);
            expect(result[0].title).toBe('Morning Workout');
        });
    });

    describe('routines.create', () => {
        it('should create new routine', async () => {
            const mockInsert = vi.fn().mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{
                        id: 'routine-id',
                        title: 'Test Routine',
                        dayOfWeek: 1,
                        startTime: '09:00',
                        endTime: '10:00',
                        userId: mockUser.id,
                    }]),
                }),
            });

            mockDb.insert = mockInsert;

            const caller = createAuthCaller();
            const result = await caller.routines.create({
                title: 'Test Routine',
                dayOfWeek: 1,
                startTime: '09:00',
                endTime: '10:00',
            });

            expect(result.title).toBe('Test Routine');
            expect(result.userId).toBe(mockUser.id);
        });

        it('should throw error for empty title', async () => {
            const caller = createAuthCaller();

            await expect(
                caller.routines.create({
                    title: '',
                    dayOfWeek: 1,
                    startTime: '09:00',
                    endTime: '10:00',
                })
            ).rejects.toThrow('Title is required');
        });

        it('should throw error for invalid time format', async () => {
            const caller = createAuthCaller();

            await expect(
                caller.routines.create({
                    title: 'Test',
                    dayOfWeek: 1,
                    startTime: '9:0',
                    endTime: '10:00',
                })
            ).rejects.toThrow('Invalid time format');
        });
    });

    describe('routines.update', () => {
        it('should update routine', async () => {
            const mockUpdate = vi.fn().mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([{
                            id: 'routine-id',
                            title: 'Updated Title',
                            dayOfWeek: 2,
                            startTime: '10:00',
                            endTime: '11:00',
                        }]),
                    }),
                }),
            });

            mockDb.update = mockUpdate;

            const caller = createAuthCaller();
            const result = await caller.routines.update({
                id: 'routine-id',
                title: 'Updated Title',
                dayOfWeek: 2,
            });

            expect(result.title).toBe('Updated Title');
            expect(result.dayOfWeek).toBe(2);
        });
    });

    describe('routines.delete', () => {
        it('should delete routine', async () => {
            const mockDelete = vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(undefined),
            });

            mockDb.delete = mockDelete;

            const caller = createAuthCaller();
            const result = await caller.routines.delete({ id: 'routine-id' });

            expect(result).toEqual({ success: true });
        });
    });
});
