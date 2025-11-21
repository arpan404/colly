import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { appRouter } from '../trpc/router';
import { setupTestDb, cleanupTestDb, createTestContext } from './setup';
import { testDb } from './setup';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

describe('Auth Router', () => {
    beforeAll(async () => {
        await setupTestDb();
    });

    afterAll(async () => {
        await cleanupTestDb();
    });

    beforeEach(async () => {
        await cleanupTestDb();
    });

    describe('signup', () => {
        it('should create a new user successfully', async () => {
            const caller = appRouter.createCaller(createTestContext());

            const result = await caller.auth.signup({
                email: 'test@example.com',
                password: 'Password123',
                name: 'Test User',
            });
            expect(result).toHaveProperty('token');

            const [dbUser] = await testDb.select().from(users).where(eq(users.email, 'test@example.com'));
            expect(dbUser).toBeDefined();
        });

        it('should throw error for existing email', async () => {
            await testDb.insert(users).values({
                email: 'existing@example.com',
                password: 'hashedpass',
            });

            const caller = appRouter.createCaller(createTestContext());

            await expect(
                caller.auth.signup({
                    email: 'existing@example.com',
                    password: 'Password123',
                })
            ).rejects.toThrow('User already exists');
        });

        it('should throw error for invalid email', async () => {
            const caller = appRouter.createCaller(createTestContext());

            await expect(
                caller.auth.signup({
                    email: 'invalid-email',
                    password: 'Password123',
                })
            ).rejects.toThrow();
        });

        it('should throw error for short password', async () => {
            const caller = appRouter.createCaller(createTestContext());

            await expect(
                caller.auth.signup({
                    email: 'test@example.com',
                    password: '123',
                })
            ).rejects.toThrow();
        });
    });

    describe('login', () => {
        beforeEach(async () => {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('Password123', 10);

            await testDb.insert(users).values({
                email: 'test@example.com',
                password: hashedPassword,
                name: 'Test User',
            });
        });

        it('should login successfully with correct credentials', async () => {
            const caller = appRouter.createCaller(createTestContext());

            const result = await caller.auth.login({
                email: 'test@example.com',
                password: 'Password123',
            });
            expect(result).toHaveProperty('token');
        });

        it('should throw error for non-existent user', async () => {
            const caller = appRouter.createCaller(createTestContext());

            await expect(
                caller.auth.login({
                    email: 'nonexistent@example.com',
                    password: 'Password123',
                })
            ).rejects.toThrow('Invalid credentials');
        });

        it('should throw error for wrong password', async () => {
            const caller = appRouter.createCaller(createTestContext());

            await expect(
                caller.auth.login({
                    email: 'test@example.com',
                    password: 'WrongPassword123',
                })
            ).rejects.toThrow('Invalid credentials');
        });

        it('should throw error for invalid email format', async () => {
            const caller = appRouter.createCaller(createTestContext());

            await expect(
                caller.auth.login({
                    email: 'invalid-email',
                    password: 'Password123',
                })
            ).rejects.toThrow();
        });
    });
});
