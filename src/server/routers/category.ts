import { router, publicProcedure } from '../trpc';
import { db } from '@/src/db'; // Corrected path
import { categories } from '@/src/db/schema'; // Corrected path
import { insertCategorySchema, updateCategorySchema } from '@/src/lib/schema'; // Corrected path
import { z } from 'zod';
import { eq } from 'drizzle-orm';

// We can reuse this slugify function
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

export const categoryRouter = router({
  
  // --- GET ALL ---
  getAll: publicProcedure.query(async () => {
    return await db.query.categories.findMany();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const category = await db.query.categories.findFirst({
        where: eq(categories.id, input.id),
      });

      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    }),

  // --- CREATE ---
  create: publicProcedure
    .input(insertCategorySchema)
    .mutation(async ({ input }) => {
      const slug = slugify(input.name);
      
      const newCategories = await db.insert(categories)
        .values({
          name: input.name,
          description: input.description,
          slug: slug,
        })
        .returning();
        
      return newCategories[0];
    }),

  // --- UPDATE ---
  update: publicProcedure
    .input(updateCategorySchema)
    .mutation(async ({ input }) => { // <-- FIX: Corrected function definition
      const { id, ...dataToUpdate } = input;
      
      // If the name is being updated, we must re-generate the slug
      // Drizzle's 'set' method requires a specific type, so we build it
      const newValues: { 
        name?: string; 
        description?: string | null; 
        slug?: string 
      } = {};

      if (dataToUpdate.name) {
        newValues.name = dataToUpdate.name;
        newValues.slug = slugify(dataToUpdate.name);
      }
      
      if (dataToUpdate.description) {
        newValues.description = dataToUpdate.description;
      }

      const updatedCategories = await db.update(categories)
        .set(newValues)
        .where(eq(categories.id, id))
        .returning();
        
      return updatedCategories[0];
    }),

  // --- DELETE ---
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => { // <-- FIX: Corrected function definition
      const deletedCategories = await db.delete(categories)
        .where(eq(categories.id, input.id))
        .returning();
        
      return deletedCategories[0];
    }),
});