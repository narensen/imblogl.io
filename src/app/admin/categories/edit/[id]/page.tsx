'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';

import { trpc } from '@/src/app/api/trpc/client';
import { updateCategorySchema, TUpdateCategorySchema } from '@/src/lib/schema';
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

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);

  const { data: category, isLoading } = trpc.category.getById.useQuery({
    id: categoryId,
  });

  const form = useForm<TUpdateCategorySchema>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      id: categoryId,
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        id: category.id,
        name: category.name,
        description: category.description || '',
      });
    }
  }, [category, form]);

  const updateCategory = trpc.category.update.useMutation({
    onSuccess: () => {
      router.push('/admin/categories');
    },
    onError: (error) => {
      console.error('Error updating category:', error);
    },
  });

  const onSubmit = (data: TUpdateCategorySchema) => {
    updateCategory.mutate(data);
  };

  if (isLoading) return <div>Loading category...</div>;
  if (!category) return <div>Category not found.</div>;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Edit Category</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={updateCategory.isPending}>
            {updateCategory.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  );
}