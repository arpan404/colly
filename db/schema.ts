import { pgTable, text, timestamp, integer, boolean, decimal, jsonb, uuid, varchar, date, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: text('password').notNull(),
  name: varchar('name', { length: 255 }),
  avatar: text('avatar'), // URL to avatar image
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User preferences/settings
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  theme: varchar('theme', { length: 20 }).default('light').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  notifications: boolean('notifications').default(true).notNull(),
  emailNotifications: boolean('email_notifications').default(true).notNull(),
  emailWeeklySummary: boolean('email_weekly_summary').default(true).notNull(),
  emailReminders: boolean('email_reminders').default(true).notNull(),
  emailAchievements: boolean('email_achievements').default(true).notNull(),
  fontSize: varchar('font_size', { length: 10 }).default('medium').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Events (personal and community)
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startDate: date('start_date').notNull(),
  startTime: time('start_time'),
  endDate: date('end_date'),
  endTime: time('end_time'),
  location: varchar('location', { length: 255 }),
  category: varchar('category', { length: 50 }),
  isPublic: boolean('is_public').default(false).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Weekly routines
export const routines = pgTable('routines', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sunday-Saturday)
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  isRecurring: boolean('is_recurring').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Budget categories
export const budgetCategories = pgTable('budget_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }), // hex color
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Monthly budgets
export const budgets = pgTable('budgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid('category_id').references(() => budgetCategories.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  month: integer('month').notNull(), // 1-12
  year: integer('year').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Transactions
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  categoryId: uuid('category_id').references(() => budgetCategories.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: varchar('description', { length: 255 }),
  date: date('date').notNull(),
  type: varchar('type', { length: 20 }).default('expense').notNull(), // expense, income
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Wellness logs
export const wellnessLogs = pgTable('wellness_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  mood: integer('mood'), // 1-5 scale
  sleepHours: decimal('sleep_hours', { precision: 4, scale: 2 }),
  waterGlasses: integer('water_glasses'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Flashcard decks
export const flashcardDecks = pgTable('flashcard_decks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false).notNull(),
  category: varchar('category', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Flashcards
export const flashcards = pgTable('flashcards', {
  id: uuid('id').primaryKey().defaultRandom(),
  deckId: uuid('deck_id').references(() => flashcardDecks.id, { onDelete: 'cascade' }).notNull(),
  front: text('front').notNull(),
  back: text('back').notNull(),
  difficulty: integer('difficulty').default(3).notNull(), // 1-5 scale
  lastReviewed: timestamp('last_reviewed'),
  nextReview: timestamp('next_review'),
  reviewCount: integer('review_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Quiz results
export const quizResults = pgTable('quiz_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  deckId: uuid('deck_id').references(() => flashcardDecks.id, { onDelete: 'cascade' }).notNull(),
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  timeSpent: integer('time_spent'), // seconds
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

// Study goals
export const studyGoals = pgTable('study_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly'
  targetValue: integer('target_value').notNull(), // e.g., 20 cards, 60 minutes
  targetUnit: varchar('target_unit', { length: 20 }).notNull(), // 'cards', 'minutes', 'sessions'
  currentValue: integer('current_value').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  deadline: date('deadline'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Study sessions
export const studySessions = pgTable('study_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  deckId: uuid('deck_id').references(() => flashcardDecks.id, { onDelete: 'cascade' }),
  duration: integer('duration').notNull(), // minutes
  cardsReviewed: integer('cards_reviewed').default(0).notNull(),
  sessionType: varchar('session_type', { length: 20 }).default('flashcards').notNull(), // 'flashcards', 'quiz'
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Study schedules
export const studySchedules = pgTable('study_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sunday-Saturday)
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).default('info').notNull(), // info, warning, success, error
  isRead: boolean('is_read').default(false).notNull(),
  actionUrl: varchar('action_url', { length: 500 }),
  actionText: varchar('action_text', { length: 100 }),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  preferences: many(userPreferences),
  events: many(events),
  routines: many(routines),
  budgetCategories: many(budgetCategories),
  budgets: many(budgets),
  transactions: many(transactions),
  wellnessLogs: many(wellnessLogs),
  flashcardDecks: many(flashcardDecks),
  quizResults: many(quizResults),
  studyGoals: many(studyGoals),
  studySessions: many(studySessions),
  studySchedules: many(studySchedules),
  notifications: many(notifications),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, { fields: [events.userId], references: [users.id] }),
}));

export const routinesRelations = relations(routines, ({ one }) => ({
  user: one(users, { fields: [routines.userId], references: [users.id] }),
}));

export const budgetCategoriesRelations = relations(budgetCategories, ({ one, many }) => ({
  user: one(users, { fields: [budgetCategories.userId], references: [users.id] }),
  budgets: many(budgets),
  transactions: many(transactions),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
  category: one(budgetCategories, { fields: [budgets.categoryId], references: [budgetCategories.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  category: one(budgetCategories, { fields: [transactions.categoryId], references: [budgetCategories.id] }),
}));

export const wellnessLogsRelations = relations(wellnessLogs, ({ one }) => ({
  user: one(users, { fields: [wellnessLogs.userId], references: [users.id] }),
}));

export const flashcardDecksRelations = relations(flashcardDecks, ({ one, many }) => ({
  user: one(users, { fields: [flashcardDecks.userId], references: [users.id] }),
  flashcards: many(flashcards),
  quizResults: many(quizResults),
}));

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  deck: one(flashcardDecks, { fields: [flashcards.deckId], references: [flashcardDecks.id] }),
}));

export const quizResultsRelations = relations(quizResults, ({ one }) => ({
  user: one(users, { fields: [quizResults.userId], references: [users.id] }),
  deck: one(flashcardDecks, { fields: [quizResults.deckId], references: [flashcardDecks.id] }),
}));

export const studyGoalsRelations = relations(studyGoals, ({ one }) => ({
  user: one(users, { fields: [studyGoals.userId], references: [users.id] }),
}));

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  user: one(users, { fields: [studySessions.userId], references: [users.id] }),
  deck: one(flashcardDecks, { fields: [studySessions.deckId], references: [flashcardDecks.id] }),
}));

export const studySchedulesRelations = relations(studySchedules, ({ one }) => ({
  user: one(users, { fields: [studySchedules.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));