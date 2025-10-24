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
   * Includes categories.
   */
  getAll: publicProcedure.query(async () => {
    return await db.query.posts.findMany({
      where: eq(posts.publishedStatus, true),
      orderBy: desc(posts.createdAt),
      // This 'with' clause correctly includes categories
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
   * Includes categories (implicitly via the post object structure).
   */
  getPostsByCategorySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, input.slug),
        with: {
          postsToCategories: {
            // Include the full post object which will have its own relations defined by Drizzle
            with: {
              post: {
                 with: {
                    // Make sure the nested post also gets its categories if needed elsewhere
                    postsToCategories: {
                       with: {
                          category: true
                       }
                    }
                 }
              },
            },
          },
        },
      });

      if (!category) {
        throw new Error('Category not found');
      }

      // Map, filter published, and sort
      const publishedPosts = category.postsToCategories
        .map((ptc) => ptc.post)
        .filter((post) => post.publishedStatus === true)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return publishedPosts;
    }),

  /**
   * Gets a single PUBLISHED post by its slug.
   * Includes categories.
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await db.query.posts.findFirst({
        where: and(
          eq(posts.slug, input.slug),
          eq(posts.publishedStatus, true)
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
   * Includes categories.
   */
  adminGetAll: publicProcedure.query(async () => {
    return await db.query.posts.findMany({
      orderBy: desc(posts.createdAt),
      // --- FIX: Added 'with' clause here too for consistency ---
      with: {
        postsToCategories: {
          with: {
            category: true,
          },
        },
      },
      // --- END FIX ---
    });
  }),

  /**
   * Gets a single post by its ID (draft or published).
   * Includes categories.
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
    .input(insertPostSchema)
    .mutation(async ({ input }) => {
      const slug = slugify(input.title);
      const newPosts = await db
        .insert(posts)
        .values({
          title: input.title,
          content: input.content,
          slug: slug,
          imageUrl: input.imageUrl,
        })
        .returning();
      return newPosts[0];
    }),

  /**
   * Updates a post's text fields, published status, and imageUrl.
   */
  update: publicProcedure
    .input(updatePostSchema)
    .mutation(async ({ input }) => {
      const { id, categoryIds, ...dataToUpdate } = input;
      const updatedPosts = await db
        .update(posts)
        .set({
          ...dataToUpdate,
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
      return deletedPosts[0];
    }),

  /**
   * Assigns a list of categories to a post.
   */
  assignCategories: publicProcedure
    .input(assignCategoriesSchema)
    .mutation(async ({ input }) => {
      const { postId, categoryIds } = input;
      await db
        .delete(postsToCategories)
        .where(eq(postsToCategories.postId, postId));
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