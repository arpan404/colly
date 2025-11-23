import { router } from './init';
import { authSignup } from './auth-signup';
import { authLogin } from './auth-login';
import { userGet } from './user-get';
import { dashboardGet } from './dashboard-get';
import { routinesGet, routineCreate, routineUpdate, routineDelete } from './routines';
import { budgetCategoriesGet, budgetCategoryCreate, budgetsGet, budgetCreate, transactionsGet, transactionCreate } from './budgets';
import { eventsGet, eventCreate, eventUpdate, eventDelete } from './events';
import { wellnessLogsGet, wellnessLogCreate, wellnessLogUpdate } from './wellness';
import { flashcardDecksGet, flashcardDeckCreate, flashcardDeckDelete, flashcardDeckGet, flashcardsGet, flashcardCreate, flashcardUpdate, flashcardDelete, quizResultCreate, flashcardsStatsGet, flashcardDeckStatsGet } from './flashcards';
import { studyGoalsGet, studyGoalCreate, studyGoalUpdate, studyGoalDelete, studySessionsGet, studySessionCreate, studySchedulesGet, studyScheduleCreate, studyScheduleUpdate, studyScheduleDelete, studyPlanStatsGet } from './study-plans';
import { userPreferencesGet, userPreferencesUpdate, userProfileGet, userProfileUpdate } from './user-profile';
import { notificationsRouter } from './notifications';

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
    delete: flashcardDeckDelete,
    single: flashcardDeckGet,
  }),
  get: flashcardsGet,
  create: flashcardCreate,
  update: flashcardUpdate,
  delete: flashcardDelete,
  quiz: router({
    result: router({
      create: quizResultCreate,
    }),
  }),
  stats: router({
    get: flashcardsStatsGet,
    deck: router({
      get: flashcardDeckStatsGet,
    }),
  }),
});

export const studyPlansRouter = router({
  goals: router({
    get: studyGoalsGet,
    create: studyGoalCreate,
    update: studyGoalUpdate,
    delete: studyGoalDelete,
  }),
  sessions: router({
    get: studySessionsGet,
    create: studySessionCreate,
  }),
  schedules: router({
    get: studySchedulesGet,
    create: studyScheduleCreate,
    update: studyScheduleUpdate,
    delete: studyScheduleDelete,
  }),
  stats: router({
    get: studyPlanStatsGet,
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
  studyPlans: studyPlansRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;