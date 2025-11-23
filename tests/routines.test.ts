import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { appRouter } from '../trpc/router';
import { setupTestDb, cleanupTestDb, createAuthContext, createTestContext } from './setup';
import { testDb } from './setup';
import { users, routines } from '../db/schema';

describe('Routines Router', () => {
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

    describe('get', () => {
        it('should return empty array when no routines exist', async () => {
            const caller = appRouter.createCaller(authContext);
            const result = await caller.routines.get();
            expect(result).toEqual([]);
        });

        it('should return user routines ordered by day and time', async () => {
            await testDb.insert(routines).values([
                { userId, title: 'Morning Workout', dayOfWeek: 1, startTime: '07:00', endTime: '08:00' },
                { userId, title: 'Evening Reading', dayOfWeek: 1, startTime: '20:00', endTime: '21:00' },
                { userId, title: 'Weekend Brunch', dayOfWeek: 6, startTime: '11:00', endTime: '12:00' },
            ]);

            const caller = appRouter.createCaller(authContext);
            const result = await caller.routines.get();

            expect(result).toHaveLength(3);
            expect(result[0].title).toBe('Morning Workout');
        });

        it('should not return routines from other users', async () => {
            const [otherUser] = await testDb.insert(users).values({
                email: 'other@example.com',
                password: 'hashedpassword',
            }).returning();

            await testDb.insert(routines).values({
                userId: otherUser.id,
                title: 'Other Routine',
                dayOfWeek: 1,
                startTime: '09:00',
                endTime: '10:00',
            });

            const caller = appRouter.createCaller(authContext);
            const result = await caller.routines.get();
            expect(result).toHaveLength(0);
        });

        it('should throw error for unauthenticated user', async () => {
            const caller = appRouter.createCaller(createTestContext());
            await expect(caller.routines.get()).rejects.toThrow('Unauthorized');
        });
    });

    describe('create', () => {
        it('should create a new routine', async () => {
            const caller = appRouter.createCaller(authContext);
            const result = await caller.routines.create({
                title: 'Test Routine',
                description: 'A test routine',
                dayOfWeek: 1,
                startTime: '09:00',
                endTime: '10:00',
                isRecurring: true,
            });

            expect(result).toHaveProperty('id');
            expect(result.title).toBe('Test Routine');
            expect(result.userId).toBe(userId);
        });

        it('should throw error for empty title', async () => {
            const caller = appRouter.createCaller(authContext);
            await expect(
                caller.routines.create({
                    title: '',
                    dayOfWeek: 1,
                    startTime: '09:00',
                    endTime: '10:00',
                })
            ).rejects.toThrow('Title is required');
        });

        it('should throw error for invalid dayOfWeek', async () => {
            const caller = appRouter.createCaller(authContext);
            await expect(
                caller.routines.create({
                    title: 'Test',
                    dayOfWeek: 7,
                    startTime: '09:00',
                    endTime: '10:00',
                })
            ).rejects.toThrow();
        });

        it('should throw error for unauthenticated user', async () => {
            const caller = appRouter.createCaller(createTestContext());
            await expect(
                caller.routines.create({
                    title: 'Test',
                    dayOfWeek: 1,
                    startTime: '09:00',
                    endTime: '10:00',
                })
            ).rejects.toThrow('Unauthorized');
        });
    });

    describe('update', () => {
        let routineId: string;

        beforeEach(async () => {
            const [routine] = await testDb.insert(routines).values({
                userId,
                title: 'Original Routine',
                dayOfWeek: 1,
                startTime: '09:00',
                endTime: '10:00',
            }).returning();
            routineId = routine.id;
        });

        it('should update routine title', async () => {
            const caller = appRouter.createCaller(authContext);
            const result = await caller.routines.update({
                id: routineId,
                title: 'Updated Title',
            });

            expect(result.title).toBe('Updated Title');
            expect(result.dayOfWeek).toBe(1);
        });

        it('should update multiple fields', async () => {
            const caller = appRouter.createCaller(authContext);
            const result = await caller.routines.update({
                id: routineId,
                title: 'Updated Routine',
                dayOfWeek: 2,
                startTime: '10:00',
                endTime: '11:00',
            });

            expect(result.title).toBe('Updated Routine');
            expect(result.dayOfWeek).toBe(2);
        });

        it('should throw error for unauthenticated user', async () => {
            const caller = appRouter.createCaller(createTestContext());
            await expect(
                caller.routines.update({ id: routineId, title: 'New Title' })
            ).rejects.toThrow('Unauthorized');
        });
    });

    describe('delete', () => {
        let routineId: string;

        beforeEach(async () => {
            const [routine] = await testDb.insert(routines).values({
                userId,
                title: 'Routine to Delete',
                dayOfWeek: 1,
                startTime: '09:00',
                endTime: '10:00',
            }).returning();
            routineId = routine.id;
        });

        it('should delete routine', async () => {
            const caller = appRouter.createCaller(authContext);
            const result = await caller.routines.delete({ id: routineId });

            expect(result).toEqual({ success: true });

            const routinesList = await caller.routines.get();
            expect(routinesList).toHaveLength(0);
        });

        it('should throw error for unauthenticated user', async () => {
            const caller = appRouter.createCaller(createTestContext());
            await expect(caller.routines.delete({ id: routineId })).rejects.toThrow('Unauthorized');
        });
    });
});
