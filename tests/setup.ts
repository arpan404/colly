import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

const testConnectionString = process.env.DATABASE_URL_TEST || 'postgresql://postgres:password@localhost:5432/colly_test';

const client = postgres(testConnectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const testDb = drizzle(client, { schema });

export async function setupTestDb() {
  // Tables are created via migrations
}

export async function cleanupTestDb() {
  const { quizResults, flashcards, flashcardDecks, wellnessLogs, transactions, budgets, budgetCategories, routines, events, userPreferences, users } = schema;

  await testDb.delete(quizResults);
  await testDb.delete(flashcards);
  await testDb.delete(flashcardDecks);
  await testDb.delete(wellnessLogs);
  await testDb.delete(transactions);
  await testDb.delete(budgets);
  await testDb.delete(budgetCategories);
  await testDb.delete(routines);
  await testDb.delete(events);
  await testDb.delete(userPreferences);
  await testDb.delete(users);
}

export function createTestContext() {
  return {
    db: testDb,
    req: new Request('http://localhost:3000'),
  };
}

import { JWT_SECRET } from '../trpc/init';

export function createAuthContext(user: { id: string; email: string }) {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(user, JWT_SECRET);

  return {
    db: testDb,
    req: new Request('http://localhost:3000', {
      headers: { 'Authorization': `Bearer ${token}` },
    }),
  };
}