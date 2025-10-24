'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';

import { trpc } from '@/src/app/api/trpc/client';
import { updatePostSchema, TUpdatePostSchema } from '@/src/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);

  // 1. Fetch the post data
  const { data: post, isLoading } = trpc.post.getById.useQuery({ id: postId });

  // 2. Setup the form
  const form = useForm<TUpdatePostSchema>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      id: postId,
      title: '',
      content: '',
      publishedStatus: false,
    },
  });

  // 3. Populate the form once the data is loaded
  useEffect(() => {
    if (post) {
      form.reset({
        id: post.id,
        title: post.title,
        content: post.content,
        publishedStatus: post.publishedStatus,
      });
    }
  }, [post, form]);

  // 4. Setup the update mutation
  const updatePost = trpc.post.update.useMutation({
    onSuccess: () => {
      router.push('/admin/posts');
      // TODO: Add toast
    },
    onError: (error) => {
      console.error('Error updating post:', error);
      // TODO: Show error toast
    },
  });

  // 5. Submit handler
  const onSubmit = (data: TUpdatePostSchema) => {
    updatePost.mutate(data);
  };

  if (isLoading) return <div>Loading post...</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Edit Post</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post Title</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Textarea className="min-h-[300px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* This is a "Priority 2" feature */}
          <FormField
            control={form.control}
            name="publishedStatus"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormLabel>Published</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={updatePost.isPending}>
            {updatePost.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  );
}