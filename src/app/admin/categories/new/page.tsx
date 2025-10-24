'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { trpc } from '@/src/app/api/trpc/client';
import { insertCategorySchema, TInsertCategorySchema } from '@/src/lib/schema';
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

export default function CreateCategoryForm() {
  const router = useRouter();

  const form = useForm<TInsertCategorySchema>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const createCategory = trpc.category.create.useMutation({
    onSuccess: () => {
      router.push('/admin/categories');
    },
    onError: (error) => {
      console.error('Error creating category:', error);
    },
  });

  const onSubmit = (data: TInsertCategorySchema) => {
    createCategory.mutate(data);
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Create New Category</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="Tech" {...field} />
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
                  <Textarea
                    placeholder="All about the latest in tech..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={createCategory.isPending}>
            {createCategory.isPending ? 'Saving...' : 'Create Category'}
          </Button>
        </form>
      </Form>
    </div>
  );
}