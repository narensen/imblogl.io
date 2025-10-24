import { router, publicProcedure } from '../trpc';
import { postRouter } from './post'; 
import { categoryRouter } from './category';

export const appRouter = router({
  post: postRouter,
  category: categoryRouter,
  
  healthcheck: publicProcedure.query(() => {
    return 'OK';
  }),
});

export type AppRouter = typeof appRouter;