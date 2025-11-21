import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

vi.mock('../lib/db', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('bcrypt', () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    },
}));

vi.mock('jsonwebtoken', () => {
    const sign = vi.fn(() => 'test-token');
    return {
        default: { sign },
        sign,
    };
});

const { appRouter } = await import('../trpc/router');
const bcrypt = await import('bcrypt');
const jwt = await import('jsonwebtoken');
const dbModule = await import('../lib/db');

describe('Auth Unit Tests', () => {
    const mockDb = vi.mocked(dbModule.db);
    const mockBcrypt = vi.mocked(bcrypt.default);
    const mockJwt = vi.mocked(jwt.default);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('signup', () => {
        it('should create new user and return token', async () => {
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
                        id: 'user-id',
                        email: 'test@example.com',
                        name: 'Test User',
                    }]),
                }),
            });

            mockDb.select = mockSelect;
            mockDb.insert = mockInsert;
            mockBcrypt.hash.mockResolvedValue('hashed-password' as never);

            const caller = appRouter.createCaller({
                db: mockDb as any,
                req: new Request('http://localhost:3000'),
            });

            const result = await caller.auth.signup({
                email: 'test@example.com',
                password: 'Password123!',
                name: 'Test User',
            });

            expect(result).toHaveProperty('token');
            expect(mockBcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
        });

        it('should throw error if user already exists', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([{ id: 'existing-user' }]),
                    }),
                }),
            });

            mockDb.select = mockSelect;

            const caller = appRouter.createCaller({
                db: mockDb as any,
                req: new Request('http://localhost:3000'),
            });

            await expect(
                caller.auth.signup({
                    email: 'existing@example.com',
                    password: 'Password123!',
                })
            ).rejects.toThrow('User already exists');
        });
    });

    describe('login', () => {
        it('should return token for valid credentials', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([{
                            id: 'user-id',
                            email: 'test@example.com',
                            password: 'hashed-password',
                        }]),
                    }),
                }),
            });

            mockDb.select = mockSelect;
            mockBcrypt.compare.mockResolvedValue(true as never);

            const caller = appRouter.createCaller({
                db: mockDb as any,
                req: new Request('http://localhost:3000'),
            });

            const result = await caller.auth.login({
                email: 'test@example.com',
                password: 'Password123!',
            });

            expect(result).toHaveProperty('token');
            expect(mockBcrypt.compare).toHaveBeenCalledWith('Password123!', 'hashed-password');
        });

        it('should throw error for invalid credentials', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([{
                            id: 'user-id',
                            password: 'hashed-password',
                        }]),
                    }),
                }),
            });

            mockDb.select = mockSelect;
            mockBcrypt.compare.mockResolvedValue(false as never);

            const caller = appRouter.createCaller({
                db: mockDb as any,
                req: new Request('http://localhost:3000'),
            });

            await expect(
                caller.auth.login({
                    email: 'test@example.com',
                    password: 'wrong-password',
                })
            ).rejects.toThrow('Invalid credentials');
        });

        it('should throw error for non-existent user', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([]),
                    }),
                }),
            });

            mockDb.select = mockSelect;

            const caller = appRouter.createCaller({
                db: mockDb as any,
                req: new Request('http://localhost:3000'),
            });

            await expect(
                caller.auth.login({
                    email: 'nonexistent@example.com',
                    password: 'Password123!',
                })
            ).rejects.toThrow('Invalid credentials');
        });
    });
});
