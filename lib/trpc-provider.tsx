'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from './trpc-client';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: typeof window !== 'undefined' ? '/api/trpc' : 'http://localhost:3000/api/trpc',
          // Provide headers per-request so the latest token from localStorage is used
          headers: async () => {
            try {
              if (typeof window === 'undefined') return {};
              const token = localStorage.getItem('token');
              return token ? { authorization: `Bearer ${token}` } : {};
            } catch {
              return {};
            }
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

