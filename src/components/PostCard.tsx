import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import CategoryBadge from './CategoryBadge';
import Image from 'next/image'; // <-- 1. Import next/image for optimization

import type { AppRouter } from '@/src/server/routers/_app';
import type { inferRouterOutputs } from '@trpc/server';

type RouterOutputs = inferRouterOutputs<AppRouter>;
// This type definition expects the 'createdAt'/'updatedAt' to be strings
// because the page.tsx is converting them. It also needs imageUrl
type PostWithCategories = Omit<
    RouterOutputs['post']['getAll'][number],
    'createdAt' | 'updatedAt'
> & {
    createdAt: string;
    updatedAt: string;
};

type PostCardProps = {
    post: PostWithCategories;
};

export default function PostCard({ post }: PostCardProps) {
    const categories = post.postsToCategories.map((ptc) => ptc.category);
    const createdAtDate = new Date(post.createdAt);
    const formattedDate = createdAtDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <article className="flex max-w-xl flex-col items-start justify-between">
            {/* 2. Add Image if imageUrl exists */}
            {post.imageUrl && (
                <div className="relative w-full aspect-video mb-4"> {/* Aspect ratio container */}
                    <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill // Makes image fill the container
                        className="object-cover rounded-lg" // Cover ensures aspect ratio, rounded corners
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw" // Helps with optimization
                    />
                </div>
            )}
            <div className="flex w-full flex-col justify-between">
                <CardHeader className="p-0">
                    <div className="flex items-center gap-x-4 text-xs text-gray-500">
                        <time dateTime={createdAtDate.toISOString()}>{formattedDate}</time>
                    </div>
                    <CardTitle className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                        <Link href={`/post/${post.slug}`}>
                            {/* Removed absolute positioning span as it interferes with image link */}
                            {post.title}
                        </Link>
                    </CardTitle>
                    <CardDescription className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                        {post.content}
                    </CardDescription>
                </CardHeader>
                <CardFooter className="mt-6 flex flex-wrap gap-2 p-0">
                    {categories.map((category) => (
                        <CategoryBadge key={category.id} categoryName={category.name} />
                    ))}
                </CardFooter>
            </div>
        </article>
    );
}