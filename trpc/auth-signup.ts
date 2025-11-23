import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { TRPCError } from '@trpc/server';
import { publicProcedure, JWT_SECRET } from './init';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../lib/logger';
import { rateLimit } from './rate-limit';

export const authSignup = publicProcedure
  .use(rateLimit)
  .input(z.object({
    email: z.string().email('Invalid email format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const startTime = Date.now();

    try {
      const existingUser = await ctx.db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existingUser.length > 0) {
        logger.warn('Signup attempt with existing email', { email: input.email });
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        });
      }

      const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
      const hashedPassword = await bcrypt.hash(input.password, bcryptRounds);
      const [user] = await ctx.db.insert(users).values({
        email: input.email,
        password: hashedPassword,
        name: input.name,
      }).returning();

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      logger.info('User signup successful', {
        userId: user.id,
        email: input.email,
        duration: Date.now() - startTime,
      });

      return { token };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      logger.error('Signup error', {
        email: input.email,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
      });
    }
  });