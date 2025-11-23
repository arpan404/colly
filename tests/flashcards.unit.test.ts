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

describe('Flashcards Unit Tests', () => {
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

    describe('flashcards.decks.get', () => {
        it('should return user decks', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    leftJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            groupBy: vi.fn().mockReturnValue({
                                orderBy: vi.fn().mockResolvedValue([
                                    { deck: { id: 'd1', title: 'Spanish Vocabulary', userId: mockUser.id }, cardCount: 10 },
                                    { deck: { id: 'd2', title: 'Math Formulas', userId: mockUser.id }, cardCount: 5 },
                                ]),
                            }),
                        }),
                    }),
                }),
            });

            mockDb.select = mockSelect;

            const caller = createAuthCaller();
            const result = await caller.flashcards.decks.get();

            expect(result).toHaveLength(2);
            expect(result[0].deck.title).toBe('Spanish Vocabulary');
        });
    });

    describe('flashcards.decks.create', () => {
        it('should create new deck', async () => {
            const mockInsert = vi.fn().mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{
                        id: 'deck-id',
                        title: 'New Deck',
                        userId: mockUser.id,
                    }]),
                }),
            });

            mockDb.insert = mockInsert;

            const caller = createAuthCaller();
            const result = await caller.flashcards.decks.create({
                title: 'New Deck',
            });

            expect(result.title).toBe('New Deck');
            expect(result.userId).toBe(mockUser.id);
        });
    });

    describe('flashcards.get', () => {
        it('should return cards for deck', async () => {
            const mockSelect = vi.fn()
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue([{ id: 'deck-1', userId: mockUser.id }]),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            orderBy: vi.fn().mockResolvedValue([
                                { id: 'c1', front: 'Hello', back: 'Hola', deckId: 'deck-1' },
                                { id: 'c2', front: 'Goodbye', back: 'Adiós', deckId: 'deck-1' },
                            ]),
                        }),
                    }),
                });

            mockDb.select = mockSelect;

            const caller = createAuthCaller();
            const result = await caller.flashcards.get({ deckId: 'deck-1' });

            expect(result).toHaveLength(2);
            expect(result[0].front).toBe('Hello');
        });
    });

    describe('flashcards.create', () => {
        it('should create new card', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([{ id: 'deck-1', userId: mockUser.id }]),
                    }),
                }),
            });

            const mockInsert = vi.fn().mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{
                        id: 'card-id',
                        deckId: 'deck-1',
                        front: 'Question',
                        back: 'Answer',
                    }]),
                }),
            });

            mockDb.select = mockSelect;
            mockDb.insert = mockInsert;

            const caller = createAuthCaller();
            const result = await caller.flashcards.create({
                deckId: 'deck-1',
                front: 'Question',
                back: 'Answer',
            });

            expect(result.front).toBe('Question');
            expect(result.back).toBe('Answer');
        });
    });

    describe('flashcards.update', () => {
        it('should update card', async () => {
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([{
                            userId: mockUser.id,
                        }]),
                    }),
                }),
            });

            const mockUpdate = vi.fn().mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([{
                            id: 'card-id',
                            front: 'Updated Question',
                            back: 'Updated Answer',
                            deckId: 'deck-1',
                        }]),
                    }),
                }),
            });

            mockDb.select = mockSelect;
            mockDb.update = mockUpdate;

            const caller = createAuthCaller();
            const result = await caller.flashcards.update({
                id: 'card-id',
                front: 'Updated Question',
            });

            expect(result.front).toBe('Updated Question');
        });
    });
});
