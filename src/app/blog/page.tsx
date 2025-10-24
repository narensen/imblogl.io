import { serverTrpc } from '@/src/app/api//trpc/server';
import PostCard from '@/src/components/PostCard';
import { Button } from '@/components/ui/button';
import CategoryBadge from '@/src/components/CategoryBadge';
import Link from 'next/link';

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categorySlug = searchParams.category;
  const categories = await serverTrpc.category.getAll();

  let posts;
  if (categorySlug) {
    posts = await serverTrpc.post.getPostsByCategorySlug({ slug: categorySlug });
  } else {
    posts = await serverTrpc.post.getAll();
  }

  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1, 3);
  const allOtherPosts = posts.slice(3);

  return (
    <div className="bg-white">
      <main className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Recent blog posts
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            A blog about design, software, and everything in between.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <Link href="/blog">
            <CategoryBadge
              categoryName="All posts"
              variant={!categorySlug ? 'default' : 'outline'}
            />
          </Link>
          {categories.map((category) => (
            <Link key={category.id} href={`/blog?category=${category.slug}`}>
              <CategoryBadge
                categoryName={category.name}
                variant={
                  categorySlug === category.slug ? 'default' : 'outline'
                }
              />
            </Link>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:grid-cols-2">
          <div className="lg:col-span-1">
            {featuredPost && (
              <PostCard
                key={featuredPost.id}
                post={{
                  ...featuredPost,
                  postsToCategories: featuredPost.postsToCategories, // <-- FIX 1
                  createdAt: featuredPost.createdAt.toISOString(),
                  updatedAt: featuredPost.updatedAt.toISOString(),
                }}
              />
            )}
          </div>

          <div className="lg:col-span-1 flex flex-col gap-y-12">
            {secondaryPosts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  postsToCategories: post.postsToCategories, // <-- FIX 2
                  createdAt: post.createdAt.toISOString(),
                  updatedAt: post.updatedAt.toISOString(),
                }}
              />
            ))}
          </div>
        </div>

        {allOtherPosts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              All blog posts
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 md:grid-cols-3">
              {allOtherPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    postsToCategories: post.postsToCategories, // <-- FIX 3
                    createdAt: post.createdAt.toISOString(),
                    updatedAt: post.updatedAt.toISOString(),
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {posts.length > 0 && (
          <nav
            className="mt-16 flex items-center justify-between border-t border-gray-200 px-4 pt-8 sm:px-0"
            aria-label="Pagination"
          >
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{' '}
                <span className="font-medium">{posts.length}</span> of{' '}
                <span className="font-medium">{posts.length}</span> results
              </p>
            </div>
            <div className="flex flex-1 justify-between sm:justify-end">
              <Button variant="outline" disabled>
                Previous
              </Button>
              <Button variant="outline" className="ml-3" disabled>
                Next
              </Button>
            </div>
          </nav>
        )}
      </main>
    </div>
  );
}