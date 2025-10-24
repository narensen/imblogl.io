import { router, publicProcedure } from '../trpc';
import { db } from '@/src/db';
import { posts, categories, postsToCategories } from '@/src/db/schema';
import {
  insertPostSchema,
  updatePostSchema,
  assignCategoriesSchema,
} from '@/src/lib/schema';
import { z } from 'zod';
import { eq, desc, and } from 'drizzle-orm';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export const postRouter = router({
  // --- PUBLIC, FILTERED PROCEDURES (for homepage) ---

  /**
   * Gets all PUBLISHED posts, sorted newest-first.
   */
  getAll: publicProcedure.query(async () => {
    return await db.query.posts.findMany({
      where: eq(posts.publishedStatus, true), // Only get published posts
      orderBy: desc(posts.createdAt), // Sort newest-first
      with: {
        postsToCategories: {
          with: {
            category: true,
          },
        },
      },
    });
  }),

  /**
   * Gets all PUBLISHED posts for a specific category, sorted newest-first.
   */
  getPostsByCategorySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      // 1. Find the category and include its post relationships
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, input.slug),
        with: {
          postsToCategories: {
            with: {
              post: true, // 2. Include the full post object
            },
          },
        },
      });

      if (!category) {
        throw new Error('Category not found');
      }

      // 3. Filter the results in code
      const publishedPosts = category.postsToCategories
        .map((ptc) => ptc.post)
        .filter((post) => post.publishedStatus === true) // Only get published posts
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort newest-first

      return publishedPosts;
    }),

  /**
   * Gets a single PUBLISHED post by its slug.
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await db.query.posts.findFirst({
        where: and(
          eq(posts.slug, input.slug),
          eq(posts.publishedStatus, true) // Only get published posts
        ),
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

  // --- ADMIN/CRUD PROCEDURES (for admin panel) ---

  /**
   * Gets ALL posts (drafts and published) for the admin panel.
   */
  adminGetAll: publicProcedure.query(async () => {
    return await db.query.posts.findMany({
      orderBy: desc(posts.createdAt), // Sort newest-first
    });
  }),

  /**
   * Gets a single post by its ID (draft or published).
   * This is for the "Edit Post" page.
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, input.id),
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

  /**
   * Creates a new post (as a draft). Now includes imageUrl.
   */
  create: publicProcedure
    .input(insertPostSchema) // Includes optional imageUrl
    .mutation(async ({ input }) => {
      const slug = slugify(input.title);

      const newPosts = await db
        .insert(posts)
        .values({
          title: input.title,
          content: input.content,
          slug: slug,
          imageUrl: input.imageUrl, // Pass imageUrl to DB
          // 'publishedStatus' defaults to false
        })
        .returning();

      return newPosts[0];
    }),

  /**
   * Updates a post's text fields, published status, and imageUrl.
   */
  update: publicProcedure
    .input(updatePostSchema) // Includes optional imageUrl
    .mutation(async ({ input }) => {
      const { id, categoryIds, ...dataToUpdate } = input;

      const updatedPosts = await db
        .update(posts)
        .set({
          ...dataToUpdate, // This includes imageUrl
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id))
        .returning();

      return updatedPosts[0];
    }),

  /**
   * Deletes a post.
   */
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const deletedPosts = await db
        .delete(posts)
        .where(eq(posts.id, input.id))
        .returning();

      // TODO: Consider deleting the associated image from Vercel Blob here

      return deletedPosts[0];
    }),

  /**
   * Assigns a list of categories to a post.
   */
  assignCategories: publicProcedure
    .input(assignCategoriesSchema)
    .mutation(async ({ input }) => {
      const { postId, categoryIds } = input;

      // 1. Delete all existing relationships
      await db
        .delete(postsToCategories)
        .where(eq(postsToCategories.postId, postId));

      // 2. Insert the new ones (if any)
      if (categoryIds.length > 0) {
        const newRelations = categoryIds.map((catId) => ({
          postId: postId,
          categoryId: catId,
        }));

        await db.insert(postsToCategories).values(newRelations);
      }

      return { success: true };
    }),
});