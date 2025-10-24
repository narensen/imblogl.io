'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { trpc } from '@/src/app/api/trpc/client';
import { insertPostSchema, TInsertPostSchema } from '@/src/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export default function CreatePostForm() {
  const router = useRouter();

  const form = useForm<TInsertPostSchema>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const createPost = trpc.post.create.useMutation({
    onSuccess: () => {
      // TODO: Add toast notification
      router.push('/admin/posts');
    },
    onError: (error) => {
      console.error('Error creating post:', error);
      // TODO: Show error toast
    },
  });

  const onSubmit = (data: TInsertPostSchema) => {
    createPost.mutate(data);
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Create New Post</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post Title</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Post" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content (Markdown)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Start writing your post..."
                    className="min-h-[300px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* FIX 1: 'isLoading' renamed to 'isPending' */}
          <Button type="submit" disabled={createPost.isPending}>
            {/* FIX 2: 'isLoading' renamed to 'isPending' */}
            {createPost.isPending ? 'Saving...' : 'Create Post'}
          </Button>
        </form>
      </Form>
    </div>
  );
}