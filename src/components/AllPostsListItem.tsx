import Link from 'next/link';
import CategoryBadge from './CategoryBadge';

import type { AppRouter } from '@/src/server/routers/_app';
import type { inferRouterOutputs } from '@trpc/server';

type RouterOutputs = inferRouterOutputs<AppRouter>;
// This type definition expects the 'createdAt'/'updatedAt' to be strings
// because the page.tsx is converting them.
type PostWithCategories = Omit<
  RouterOutputs['post']['getAll'][number],
  'createdAt' | 'updatedAt'
> & {
  createdAt: string;
  updatedAt: string;
};

type PostItemProps = {
  post: PostWithCategories;
};

export default function AllPostsListItem({ post }: PostItemProps) {
  const categories = post.postsToCategories.map((ptc) => ptc.category);
  // No date formatting needed, as we're not displaying it in this view

  return (
    <article className="flex flex-col items-start justify-between">
      <div className="relative w-full">
        <h3 className="text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
          <Link href={`/post/${post.slug}`}>
            <span className="absolute inset-0" />
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
          {post.content}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <CategoryBadge key={category.id} categoryName={category.name} />
        ))}
      </div>
    </article>
  );
}