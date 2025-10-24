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
import { Checkbox } from '@/components/ui/checkbox'; // <-- 1. Import Checkbox
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

  // 2. Fetch post *and* all categories
  const { data: post, isLoading: isLoadingPost } = trpc.post.getById.useQuery({
    id: postId,
  });
  const { data: allCategories, isLoading: isLoadingCategories } =
    trpc.category.getAll.useQuery();

  const form = useForm<TUpdatePostSchema>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      id: postId,
      title: '',
      content: '',
      publishedStatus: false,
      categoryIds: [], // <-- 3. Add to default values
    },
  });

  // 4. Populate form with post data AND category IDs
  useEffect(() => {
    if (post) {
      const currentCategoryIds = post.postsToCategories.map(
        (ptc) => ptc.categoryId,
      );
      form.reset({
        id: post.id,
        title: post.title,
        content: post.content,
        publishedStatus: post.publishedStatus,
        categoryIds: currentCategoryIds, // <-- 4. Set current categories
      });
    }
  }, [post, form]);

  // 5. Setup *both* mutations
  const updatePost = trpc.post.update.useMutation();
  const assignCategories = trpc.post.assignCategories.useMutation({
    onSuccess: () => {
      router.push('/admin/posts');
    },
    onError: (error) => {
      console.error('Error assigning categories:', error);
    },
  });

  // 6. Update submit handler to call both mutations
  const onSubmit = (data: TUpdatePostSchema) => {
    const { categoryIds, ...postData } = data;
    
    // Call the first mutation
    updatePost.mutate(postData, {
      onSuccess: () => {
        // On success, call the second mutation
        assignCategories.mutate({
          postId: postData.id,
          categoryIds: categoryIds || [],
        });
      },
    });
  };

  const isLoading = isLoadingPost || isLoadingCategories;
  if (isLoading) return <div>Loading post...</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Edit Post</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* ... (Title Field) ... */}
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

          {/* ... (Content Field) ... */}
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

          {/* --- 7. NEW CATEGORY FIELD --- */}
          <FormField
            control={form.control}
            name="categoryIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categories</FormLabel>
                <div className="grid grid-cols-3 gap-2">
                  {allCategories?.map((category) => (
                    <FormItem
                      key={category.id}
                      className="flex items-center space-x-2"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(category.id)}
                          onCheckedChange={(checked) => {
                            const newCategoryIds = field.value || [];
                            if (checked) {
                              field.onChange([
                                ...newCategoryIds,
                                category.id,
                              ]);
                            } else {
                              field.onChange(
                                newCategoryIds.filter(
                                  (id) => id !== category.id,
                                ),
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {category.name}
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ... (Published Field) ... */}
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

          <Button type="submit" disabled={assignCategories.isPending || updatePost.isPending}>
            {assignCategories.isPending || updatePost.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  );
}