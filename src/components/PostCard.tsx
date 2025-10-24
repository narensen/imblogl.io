import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import CategoryBadge from './CategoryBadge'; // <-- 1. Import new component

import type { AppRouter } from '@/src/server/routers/_app';
import type { inferRouterOutputs } from '@trpc/server';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type PostWithCategories = RouterOutputs['post']['getAll'][number];

type PostCardProps = {
  post: PostWithCategories;
};

export default function PostCard({ post }: PostCardProps) {
  const categories = post.postsToCategories.map((ptc) => ptc.category);

  return (
    <article className="flex max-w-xl flex-col items-start justify-between">
      <div className="flex w-full flex-col justify-between">
        <CardHeader className="p-0">
          <CardTitle className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
            <Link href={`/post/${post.slug}`}>
              <span className="absolute inset-0" />
              {post.title}
            </Link>
          </CardTitle>
          <CardDescription className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
            {post.content}
          </CardDescription>
        </CardHeader>
        <CardFooter className="mt-6 flex flex-wrap gap-2 p-0">
          {/* 2. Use the new CategoryBadge component */}
          {categories.map((category) => (
            <CategoryBadge key={category.id} categoryName={category.name} />
          ))}
        </CardFooter>
      </div>
    </article>
  );
}