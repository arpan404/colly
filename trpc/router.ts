import { router } from './init';
import { authSignup } from './auth-signup';
import { authLogin } from './auth-login';
import { userGet } from './user-get';
import { dashboardGet } from './dashboard-get';
import { routinesGet, routineCreate, routineUpdate, routineDelete } from './routines';
import { budgetCategoriesGet, budgetCategoryCreate, budgetsGet, budgetCreate, transactionsGet, transactionCreate } from './budgets';
import { eventsGet, eventCreate, eventUpdate, eventDelete } from './events';
import { wellnessLogsGet, wellnessLogCreate, wellnessLogUpdate } from './wellness';
import { flashcardDecksGet, flashcardDeckCreate, flashcardsGet, flashcardCreate, flashcardUpdate, quizResultCreate } from './flashcards';
import { userPreferencesGet, userPreferencesUpdate, userProfileGet, userProfileUpdate } from './user-profile';

export const authRouter = router({
  signup: authSignup,
  login: authLogin,
});

export const userRouter = router({
  get: userGet,
  profile: router({
    get: userProfileGet,
    update: userProfileUpdate,
  }),
  preferences: router({
    get: userPreferencesGet,
    update: userPreferencesUpdate,
  }),
});

export const dashboardRouter = router({
  get: dashboardGet,
});

export const routinesRouter = router({
  get: routinesGet,
  create: routineCreate,
  update: routineUpdate,
  delete: routineDelete,
});

export const budgetsRouter = router({
  categories: router({
    get: budgetCategoriesGet,
    create: budgetCategoryCreate,
  }),
  get: budgetsGet,
  create: budgetCreate,
  transactions: router({
    get: transactionsGet,
    create: transactionCreate,
  }),
});

export const eventsRouter = router({
  get: eventsGet,
  create: eventCreate,
  update: eventUpdate,
  delete: eventDelete,
});

export const wellnessRouter = router({
  logs: router({
    get: wellnessLogsGet,
    create: wellnessLogCreate,
    update: wellnessLogUpdate,
  }),
});

export const flashcardsRouter = router({
  decks: router({
    get: flashcardDecksGet,
    create: flashcardDeckCreate,
  }),
  get: flashcardsGet,
  create: flashcardCreate,
  update: flashcardUpdate,
  quiz: router({
    result: router({
      create: quizResultCreate,
    }),
  }),
});

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  dashboard: dashboardRouter,
  routines: routinesRouter,
  budgets: budgetsRouter,
  events: eventsRouter,
  wellness: wellnessRouter,
  flashcards: flashcardsRouter,
});

export type AppRouter = typeof appRouter;