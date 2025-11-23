import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { TRPCError } from '@trpc/server';
import { publicProcedure, JWT_SECRET } from './init';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../lib/logger';
import { rateLimit } from './rate-limit';

export const authLogin = publicProcedure
  .use(rateLimit)
  .input(z.object({ email: z.string().email('Invalid email format'), password: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const startTime = Date.now();

    try {
      const [user] = await ctx.db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (!user) {
        logger.warn('Login attempt with non-existent email', { email: input.email });
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) {
        logger.warn('Login attempt with invalid password', { email: input.email, userId: user.id });
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      logger.info('User login successful', {
        userId: user.id,
        email: input.email,
        duration: Date.now() - startTime,
      });

      return { token };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      logger.error('Login error', {
        email: input.email,
        error: error instanceof Error ? error.message.replace(/password|token|key|select|from|where|params|limit/gi, '[REDACTED]') : 'Unknown error',
        duration: Date.now() - startTime,
      });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
      });
    }
  });