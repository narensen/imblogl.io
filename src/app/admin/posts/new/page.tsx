'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { trpc } from '@/src/app/api/trpc/client';
import { insertPostSchema, TInsertPostSchema } from '@/src/lib/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
// import { useToast } from "@/components/ui/use-toast"; // <-- Remove this
import { toast } from 'sonner'; // <-- Import toast from sonner
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
  // const { toast } = useToast(); // <-- Remove this
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<TInsertPostSchema>({
    resolver: zodResolver(insertPostSchema),
    defaultValues: {
      title: '',
      content: '',
      imageUrl: undefined,
    },
  });

  const createBlobPlaceholder = trpc.blob.createBlobPlaceholder.useMutation();

  const createPost = trpc.post.create.useMutation({
    onSuccess: (newPost) => {
      // Use Sonner's success toast
      toast.success('Post created!', {
        description: `Successfully created "${newPost.title}".`,
      });
      router.push('/admin/posts');
    },
    onError: (error) => {
      // Use Sonner's error toast
      toast.error('Error creating post', {
        description: error.message,
      });
    },
  });

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

      form.setValue('imageUrl', blobInfo.url);
      // Use Sonner's success toast
      toast.success("Image uploaded successfully!");

    } catch (error) {
      console.error("Upload error:", error);
      // Use Sonner's error toast
      toast.error("Image upload failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      if (inputFileRef.current) {
        inputFileRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (data: TInsertPostSchema) => {
    createPost.mutate(data);
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Create New Post</h1>
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
                  <Input placeholder="My Awesome Post" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ... (Image Field) ... */}
          <FormItem>
            <FormLabel>Featured Image</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                ref={inputFileRef}
                onChange={handleFileChange}
                disabled={uploading || createBlobPlaceholder.isPending}
              />
            </FormControl>
            {(uploading || createBlobPlaceholder.isPending) && (
              <p className="text-sm text-muted-foreground">Uploading...</p>
            )}
            {form.watch('imageUrl') && (
              <img src={form.watch('imageUrl')} alt="Preview" className="mt-4 max-h-40 rounded border" />
            )}
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

          <Button type="submit" disabled={createPost.isPending || uploading || createBlobPlaceholder.isPending}>
            {createPost.isPending ? 'Saving...' : 'Create Post'}
          </Button>
        </form>
      </Form>
    </div>
  );
}