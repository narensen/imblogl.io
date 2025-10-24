'use client';

import { useEffect, useState, useRef } from 'react'; // <-- Import useState, useRef
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';

import { trpc } from '@/src/app/api/trpc/client';
import { updatePostSchema, TUpdatePostSchema } from '@/src/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label'; // <-- Import Label
import { toast } from 'sonner'; // <-- Import Sonner
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
  const inputFileRef = useRef<HTMLInputElement>(null); // <-- Ref for file input
  const [uploading, setUploading] = useState(false); // <-- State for upload status

  const { data: post, isLoading: isLoadingPost, refetch: refetchPost } = trpc.post.getById.useQuery({
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
      categoryIds: [],
      imageUrl: undefined, // <-- Add imageUrl default
    },
  });

  // Populate form with post data, including imageUrl
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
        categoryIds: currentCategoryIds,
        imageUrl: post.imageUrl || undefined, // <-- Set existing imageUrl
      });
    }
  }, [post, form]);

  // tRPC mutation to get blob placeholder URL
  const createBlobPlaceholder = trpc.blob.createBlobPlaceholder.useMutation();

  // Update and Assign mutations
  const updatePost = trpc.post.update.useMutation();
  const assignCategories = trpc.post.assignCategories.useMutation({
    onSuccess: () => {
      refetchPost(); // Refetch post data to ensure UI consistency if needed
      toast.success("Post updated successfully!");
      router.push('/admin/posts');
    },
    onError: (error) => {
      console.error('Error assigning categories:', error);
      toast.error("Failed to assign categories", { description: error.message });
    },
  });

  // Handler for file input change (same as Create form)
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const blobInfo = await createBlobPlaceholder.mutateAsync({ filename: file.name });
      const uploadResponse = await fetch(blobInfo.url, {
        method: 'PUT',
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed.');
      }

      form.setValue('imageUrl', blobInfo.url); // Update form state
      toast.success("Image uploaded successfully!");

    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Image upload failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      if (inputFileRef.current) {
        inputFileRef.current.value = '';
      }
      form.setValue('imageUrl', post?.imageUrl || undefined); // Reset to original image on failure
    } finally {
      setUploading(false);
    }
  };

  // Submit handler calls both mutations
  const onSubmit = (data: TUpdatePostSchema) => {
    // Ensure imageUrl is null if empty string, otherwise pass URL
    const finalData = {
      ...data,
      imageUrl: data.imageUrl === '' ? null : data.imageUrl,
    };
    const { categoryIds, ...postData } = finalData;

    updatePost.mutate(postData, {
      onSuccess: () => {
        assignCategories.mutate({
          postId: postData.id,
          categoryIds: categoryIds || [],
        });
      },
      onError: (error) => {
        toast.error("Failed to update post details", { description: error.message });
      }
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

          {/* --- IMAGE FIELD --- */}
          <FormItem>
            <FormLabel>Featured Image</FormLabel>
            {/* Display current image */}
            {form.watch('imageUrl') && (
              <div className="mb-4">
                <img src={form.watch('imageUrl')} alt="Current featured image" className="max-h-40 rounded border" />
                <Button
                  variant="link"
                  size="sm"
                  type="button"
                  className="text-red-600"
                  onClick={() => {
                      form.setValue('imageUrl', undefined); // Clear the image URL in the form
                      if (inputFileRef.current) inputFileRef.current.value = ''; // Clear file input
                  }}
                >
                  Remove Image
                </Button>
              </div>
            )}
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                ref={inputFileRef}
                onChange={handleFileChange}
                disabled={uploading || createBlobPlaceholder.isPending}
              />
            </FormControl>
            {(uploading || createBlobPlaceholder.isPending) && <p className="text-sm text-muted-foreground">Uploading...</p>}
            <FormMessage />
          </FormItem>


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

          {/* ... (Category Field) ... */}
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

          <Button type="submit" disabled={assignCategories.isPending || updatePost.isPending || uploading || createBlobPlaceholder.isPending}>
            {assignCategories.isPending || updatePost.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  );
}