import { z } from 'zod';

export const insertPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

export const updatePostSchema = z.object({
  id: z.number(),
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  publishedStatus: z.boolean().optional(),
});

export const insertCategorySchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  id: z.number(),
  name: z.string().min(3).optional(),
  description: z.string().optional(),
});

export const assignCategoriesSchema = z.object({
  postId: z.number(),
  categoryIds: z.array(z.number()), // An array of category IDs
});

export type TInsertPostSchema = z.infer<typeof insertPostSchema>;
