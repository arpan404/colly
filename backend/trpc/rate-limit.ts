import { TRPCError } from '@trpc/server';
import { middleware } from './init';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

export const rateLimit = middleware(({ ctx, next }) => {
    if (process.env.VITEST === 'true' || process.env.NODE_ENV === 'test') {
        return next();
    }

    const ip = ctx.req?.headers?.get('x-forwarded-for') ||
        ctx.req?.headers?.get('x-real-ip') ||
        'unknown';

    const now = Date.now();
    const userLimit = rateLimitMap.get(ip);

    if (!userLimit || now > userLimit.resetTime) {
        rateLimitMap.set(ip, {
            count: 1,
            resetTime: now + WINDOW_MS,
        });
        return next();
    }

    if (userLimit.count >= MAX_REQUESTS) {
        throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests, please try again later',
        });
    }

    userLimit.count++;
    return next();
});

setInterval(() => {
    const now = Date.now();
    for (const [ip, limit] of rateLimitMap.entries()) {
        if (now > limit.resetTime) {
            rateLimitMap.delete(ip);
        }
    }
}, 60000);
