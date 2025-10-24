import { serverTrpc } from '@/src/app/api/trpc/server';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';

type PostPageProps = {
  params: {
    slug: string;
  };
};

export default async function PostPage({ params }: PostPageProps) {
  let post;
  try {
    post = await serverTrpc.post.getBySlug({ slug: params.slug });
  } catch (error) {
    notFound();
  }

  const categories = post.postsToCategories.map((ptc) => ptc.category);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            {post.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {/* This is where a Markdown-to-HTML renderer would go.
              For now, we'll just output the text.
            */}
            {post.content}
          </p>
        </div>
      </div>
    </div>
  );
}