import { initTRPC, TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';
import { db } from '../lib/db';

type Context = {
  req: Request;
  db: typeof db;
};

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('CRITICAL: JWT_SECRET environment variable is not set in production!');
  // Don't exit during build, only warn
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    process.exit(1);
  }
}

export const middleware = t.middleware;
export const isAuthed = middleware(({ ctx, next }) => {
  const authHeader = ctx.req?.headers.get('authorization');
  if (!authHeader) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    return next({ ctx: { ...ctx, user: payload } });
  } catch {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    });
  }
});

export const protectedProcedure = t.procedure.use(isAuthed);