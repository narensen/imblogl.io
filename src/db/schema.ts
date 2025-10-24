import { pgTable, serial, text, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content').notNull(),
  slug: varchar('slug', { length: 256 }).notNull().unique(),
  publishedStatus: boolean('published_status').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull().unique(),
  description: text('description'),
  slug: varchar('slug', { length: 256 }).notNull().unique(),
});

export const postsToCategories = pgTable('posts_to_categories', {
  postId: integer('post_id').notNull().references(() => posts.id),
  categoryId: integer('category_id').notNull().references(() => categories.id),
});

export const postsRelations = relations(posts, ({ many }) => ({
  postsToCategories: many(postsToCategories), 
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  postsToCategories: many(postsToCategories),
}));

export const postsToCategoriesRelations = relations(postsToCategories, ({ one }) => ({

  post: one(posts, {
    fields: [postsToCategories.postId],
    references: [posts.id],
  }),

  category: one(categories, {
    fields: [postsToCategories.categoryId],
    references: [categories.id],
  }),
}));