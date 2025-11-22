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

describe('User Unit Tests', () => {
    const mockDb = vi.mocked(dbModule.db);

    const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
    };

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

    describe('user.get', () => {
        it('should return user info', async () => {
            const caller = createAuthCaller();
            const result = await caller.user.get();

            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
            });
        });
    });

    describe('user.profile.get', () => {
        it('should return user profile', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([{
                            id: mockUser.id,
                            email: mockUser.email,
                            name: mockUser.name,
                            createdAt: new Date(),
                        }]),
                    }),
                }),
            });

            mockDb.select = mockSelect;

            const caller = createAuthCaller();
            const result = await caller.user.profile.get();

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('name');
        });
    });

    describe('user.profile.update', () => {
        it('should update user name', async () => {
            const mockUpdate = vi.fn().mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([{
                            id: mockUser.id,
                            email: mockUser.email,
                            name: 'Updated Name',
                            createdAt: new Date(),
                        }]),
                    }),
                }),
            });

            mockDb.update = mockUpdate;

            const caller = createAuthCaller();
            const result = await caller.user.profile.update({ name: 'Updated Name' });

            expect(result.name).toBe('Updated Name');
        });
    });

    describe('user.preferences.get', () => {
        it('should return existing preferences', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([{
                            id: 'pref-id',
                            userId: mockUser.id,
                            theme: 'dark',
                            currency: 'USD',
                            notifications: true,
                            fontSize: 'medium',
                        }]),
                    }),
                }),
            });

            mockDb.select = mockSelect;

            const caller = createAuthCaller();
            const result = await caller.user.preferences.get();

            expect(result.theme).toBe('dark');
            expect(result.userId).toBe(mockUser.id);
        });

        it('should create default preferences if none exist', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([]),
                    }),
                }),
            });

            const mockInsert = vi.fn().mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{
                        id: 'new-pref-id',
                        userId: mockUser.id,
                        theme: 'light',
                        currency: 'USD',
                        notifications: true,
                        fontSize: 'medium',
                    }]),
                }),
            });

            mockDb.select = mockSelect;
            mockDb.insert = mockInsert;

            const caller = createAuthCaller();
            const result = await caller.user.preferences.get();

            expect(result.theme).toBe('light');
            expect(mockInsert).toHaveBeenCalled();
        });
    });

    describe('user.preferences.update', () => {
        it('should update existing preferences', async () => {
            const mockUpdate = vi.fn().mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([{
                            id: 'pref-id',
                            userId: mockUser.id,
                            theme: 'dark',
                            currency: 'EUR',
                            notifications: false,
                            fontSize: 'large',
                        }]),
                    }),
                }),
            });

            mockDb.update = mockUpdate;

            const caller = createAuthCaller();
            const result = await caller.user.preferences.update({
                theme: 'dark',
                currency: 'EUR',
            });

            expect(result.theme).toBe('dark');
            expect(result.currency).toBe('EUR');
        });
    });
});
