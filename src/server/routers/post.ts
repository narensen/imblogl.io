import { router, publicProcedure } from '../trpc';
import { db } from '@/src/db';
// FIX IS HERE:
import { posts, categories, postsToCategories } from '@/src/db/schema'; 
import { insertPostSchema, updatePostSchema } from '@/src/lib/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { assignCategoriesSchema } from '@/src/lib/schema';
import { and } from 'drizzle-orm';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export const postRouter = router({
  
  getAll: publicProcedure.query(async () => {
    return await db.query.posts.findMany({
      with: {
        postsToCategories: {
          with: {
            category: true,
          }
        }
      }
    });
  }),

  getPostsByCategorySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      // This is a more complex query.
      // 1. Find the category with the matching slug
      const category = await db.query.categories.findFirst({
        // This line will now work
        where: eq(categories.slug, input.slug), 
      });

      if (!category) {
        throw new Error('Category not found');
      }

      // 2. Find all 'postsToCategories' entries for that category
      // and include the related post for each entry.
      const posts = await db.query.postsToCategories.findMany({
        where: eq(postsToCategories.categoryId, category.id),
        with: {
          post: true, // This gets the actual post data
        }
      });

      // 3. The result is { postId, categoryId, post: {...} }
      // We just want the post data
      return posts.map(p => p.post);
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await db.query.posts.findFirst({
        where: eq(posts.slug, input.slug),
        with: {
          postsToCategories: {
            with: {
              category: true,
            },
          },
        },
      });

      if (!post) {
        throw new Error('Post not found');
      }
      return post;
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

  assignCategories: publicProcedure
    .input(assignCategoriesSchema)
    .mutation(async ({ input }) => {
      const { postId, categoryIds } = input;

      await db.delete(postsToCategories)
        .where(eq(postsToCategories.postId, postId));

      if (categoryIds.length > 0) {
        const newRelations = categoryIds.map(catId => ({
          postId: postId,
          categoryId: catId,
        }));
        
        await db.insert(postsToCategories).values(newRelations);
      }

      return { success: true };
    }),
});