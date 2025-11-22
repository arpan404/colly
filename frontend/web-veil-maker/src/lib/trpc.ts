import { createTRPCReact } from '@trpc/react-query';

// Type will be inferred from the backend router
// You can generate types using: npx @trpc/server-docs-cli generate
export type AppRouter = any;

export const trpc = createTRPCReact<AppRouter>();

