'use client';

import { trpc } from '@/src/app/api/trpc/client'; // Using your path
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PostManagementPage() {
  const router = useRouter();
  
  const { data: posts, isLoading, error, refetch } = trpc.post.adminGetAll.useQuery();

  const deletePost = trpc.post.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Failed to delete post:', error);
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate({ id });
    }
  };

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Posts</h1>
        <Button asChild>
          <Link href="/admin/posts/new">Create New Post</Link>
        </Button>
      </div>

      <div className="mt-8 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* This list will now show all posts, including Drafts */}
            {posts?.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  {post.publishedStatus ? 'Published' : 'Draft'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/posts/edit/${post.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-2"
                    onClick={() => handleDelete(post.id)}
                    disabled={deletePost.isPending}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}