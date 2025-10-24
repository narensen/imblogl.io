import { router, publicProcedure } from '../trpc';
import { postRouter } from './post'; 
import { categoryRouter } from './category';
import { blobRouter } from './blob'

export const appRouter = router({
  post: postRouter,
  category: categoryRouter,
  blob: blobRouter,
  
  healthcheck: publicProcedure.query(() => {
    return 'OK';
  }),
});

export type AppRouter = typeof appRouter;