import { serverTrpc } from '@/src/app/api/trpc/server'; // Corrected path
import PostCard from '@/src/components/PostCard'; // Corrected path
import { Button } from '@/components/ui/button'; // Corrected path
import { Badge } from '@/components/ui/badge'; // Corrected path
import CategoryBadge from '@/src/components/CategoryBadge'; // New import for CategoryBadge

export default async function HomePage() {
  const posts = await serverTrpc.post.getAll();
  const categories = await serverTrpc.category.getAll();

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

        {/* 2. Use the new CategoryBadge component for the filters */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <CategoryBadge categoryName="All posts" variant="outline" />
          {categories.map((category) => (
            <CategoryBadge
              key={category.id}
              categoryName={category.name}
              variant="outline"
            />
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                ...post,
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString(),
              }}
            />
          ))}
        </div>

        <nav
          className="mt-16 flex items-center justify-between border-t border-gray-200 px-4 pt-8 sm:px-0"
          aria-label="Pagination"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">9</span> of{' '}
              <span className="font-medium">{posts.length}</span> results
            </p>
          </div>
          <div className="flex flex-1 justify-between sm:justify-end">
            <Button variant="outline">Previous</Button>
            <Button variant="outline" className="ml-3">
              Next
            </Button>
          </div>
        </nav>
      </main>
    </div>
  );
}