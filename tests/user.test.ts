import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from '../trpc/router';
import { setupTestDb, cleanupTestDb, createTestContext, createAuthContext } from './setup';
import { testDb } from './setup';
import { users, userPreferences } from '../db/schema';
import { eq } from 'drizzle-orm';

describe('User Router', () => {
    let userId: string;
    let authContext: any;

    beforeAll(async () => {
        await setupTestDb();
        await cleanupTestDb();

        const [user] = await testDb.insert(users).values({
            email: 'test@example.com',
            password: 'hashedpassword',
            name: 'Test User',
        }).returning();

        userId = user.id;
        authContext = createAuthContext({ id: userId, email: 'test@example.com' });
    });

    afterAll(async () => {
        await cleanupTestDb();
    });

    describe('get', () => {
        it('should return user info for authenticated user', async () => {
            const caller = appRouter.createCaller(authContext);
            const result = await caller.user.get();

            expect(result).toEqual({
                id: userId,
                email: 'test@example.com',
            });
        });

        it('should throw error for unauthenticated user', async () => {
            const caller = appRouter.createCaller(createTestContext());
            await expect(caller.user.get()).rejects.toThrow('Unauthorized');
        });
    });

    describe('profile', () => {
        describe('get', () => {
            it('should return user profile', async () => {
                const caller = appRouter.createCaller(authContext);
                const result = await caller.user.profile.get();

                expect(result).toEqual({
                    id: userId,
                    email: 'test@example.com',
                    name: 'Test User',
                    createdAt: expect.any(Date),
                });
            });

            it('should throw error for unauthenticated user', async () => {
                const caller = appRouter.createCaller(createTestContext());
                await expect(caller.user.profile.get()).rejects.toThrow('Unauthorized');
            });
        });

        describe('update', () => {
            it('should update user name', async () => {
                const caller = appRouter.createCaller(authContext);
                const result = await caller.user.profile.update({ name: 'Updated Name' });

                expect(result.name).toBe('Updated Name');

                await testDb.update(users).set({ name: 'Test User' }).where(eq(users.id, userId));
            });

            it('should throw error for unauthenticated user', async () => {
                const caller = appRouter.createCaller(createTestContext());
                await expect(caller.user.profile.update({ name: 'New Name' })).rejects.toThrow('Unauthorized');
            });
        });
    });

    describe('preferences', () => {
        describe('get', () => {
            it('should return user preferences', async () => {
                const caller = appRouter.createCaller(authContext);
                const result = await caller.user.preferences.get();

                expect(result.userId).toBe(userId);
                expect(result.theme).toBe('light');
                expect(result.currency).toBe('USD');
            });

            it('should create default preferences if none exist', async () => {
                await testDb.delete(userPreferences).where(eq(userPreferences.userId, userId));

                const caller = appRouter.createCaller(authContext);
                const result = await caller.user.preferences.get();

                expect(result.userId).toBe(userId);
            });

            it('should throw error for unauthenticated user', async () => {
                const caller = appRouter.createCaller(createTestContext());
                await expect(caller.user.preferences.get()).rejects.toThrow('Unauthorized');
            });
        });

        describe('update', () => {
            it('should update preferences', async () => {
                const caller = appRouter.createCaller(authContext);
                const result = await caller.user.preferences.update({
                    theme: 'dark',
                    currency: 'EUR',
                    notifications: false,
                    fontSize: 'large',
                });

                expect(result.theme).toBe('dark');
                expect(result.currency).toBe('EUR');
                expect(result.notifications).toBe(false);
                expect(result.fontSize).toBe('large');

                await testDb.update(userPreferences)
                    .set({ theme: 'light', currency: 'USD', notifications: true, fontSize: 'medium' })
                    .where(eq(userPreferences.userId, userId));
            });

            it('should update partial preferences', async () => {
                const caller = appRouter.createCaller(authContext);
                const result = await caller.user.preferences.update({ theme: 'dark' });

                expect(result.theme).toBe('dark');
                expect(result.currency).toBe('USD');

                await testDb.update(userPreferences)
                    .set({ theme: 'light' })
                    .where(eq(userPreferences.userId, userId));
            });

            it('should throw error for invalid theme', async () => {
                const caller = appRouter.createCaller(authContext);
                await expect(
                    caller.user.preferences.update({ theme: 'invalid' as any })
                ).rejects.toThrow();
            });

            it('should throw error for unauthenticated user', async () => {
                const caller = appRouter.createCaller(createTestContext());
                await expect(caller.user.preferences.update({ theme: 'dark' })).rejects.toThrow('Unauthorized');
            });
        });
    });
});
