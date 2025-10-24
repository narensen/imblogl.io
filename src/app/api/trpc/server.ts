import { httpBatchLink } from '@trpc/client';
import { appRouter } from '@/src/server/routers/_app';
import { headers } from 'next/headers';

export const serverTrpc = appRouter.createCaller({
  links: [
    httpBatchLink({
      url: '/api/trpc', 
      async headers() { 
        return {
          ...Object.fromEntries(await headers()), 
          'x-trpc-source': 'rsc',
        };
      },
    }),
  ],
});