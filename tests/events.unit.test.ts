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

describe('Events Unit Tests', () => {
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

    describe('events.get', () => {
        it('should return user events', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockResolvedValue([
                            { id: 'e1', title: 'Meeting', startDate: '2024-01-15' },
                            { id: 'e2', title: 'Conference', startDate: '2024-01-20' },
                        ]),
                    }),
                }),
            });

            mockDb.select = mockSelect;

            const caller = createAuthCaller();
            const result = await caller.events.get({});

            expect(result).toHaveLength(2);
            expect(result[0].title).toBe('Meeting');
        });
    });

    describe('events.create', () => {
        it('should create new event', async () => {
            const mockInsert = vi.fn().mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{
                        id: 'event-id',
                        title: 'Test Event',
                        startDate: '2024-01-15',
                        startTime: '10:00',
                        userId: mockUser.id,
                    }]),
                }),
            });

            mockDb.insert = mockInsert;

            const caller = createAuthCaller();
            const result = await caller.events.create({
                title: 'Test Event',
                startDate: '2024-01-15',
                startTime: '10:00',
            });

            expect(result.title).toBe('Test Event');
            expect(result.userId).toBe(mockUser.id);
        });
    });

    describe('events.update', () => {
        it('should update event', async () => {
            const mockUpdate = vi.fn().mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([{
                            id: 'event-id',
                            title: 'Updated Event',
                            startDate: '2024-01-20',
                        }]),
                    }),
                }),
            });

            mockDb.update = mockUpdate;

            const caller = createAuthCaller();
            const result = await caller.events.update({
                id: 'event-id',
                title: 'Updated Event',
            });

            expect(result.title).toBe('Updated Event');
        });
    });

    describe('events.delete', () => {
        it('should delete event', async () => {
            const mockDelete = vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(undefined),
            });

            mockDb.delete = mockDelete;

            const caller = createAuthCaller();
            const result = await caller.events.delete({ id: 'event-id' });

            expect(result).toEqual({ success: true });
        });
    });
});
