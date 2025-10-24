import { router, publicProcedure } from '../trpc';
import { db } from '@/src/db';
import { posts } from '@/src/db/schema';
import { insertPostSchema, updatePostSchema } from '@/src/lib/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export const postRouter = router({
  
  getAll: publicProcedure.query(async () => {
    return await db.query.posts.findMany();
  }),

  create: publicProcedure
    .input(insertPostSchema)
    .mutation(async ({ input }) => {
      const slug = slugify(input.title);
      
      const newPosts = await db.insert(posts)
        .values({
          title: input.title,
          content: input.content,
          slug: slug,
        })
        .returning();
        
      return newPosts[0];
    }),

  update: publicProcedure
    .input(updatePostSchema)
    .mutation(async ({ input }) => {
      
      const { id, ...dataToUpdate } = input;

      const updatedPosts = await db.update(posts)
        .set({
          ...dataToUpdate,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id))
        .returning();
        
      return updatedPosts[0];
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      
      const deletedPosts = await db.delete(posts)
        .where(eq(posts.id, input.id))
        .returning();
        
      return deletedPosts[0];
    }),
});