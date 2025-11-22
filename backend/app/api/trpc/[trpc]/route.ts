import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc/router';
import { db } from '@/lib/db';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: ({ req }) => ({ req, db }),
  });

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:8080',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}