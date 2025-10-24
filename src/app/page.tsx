import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Header (Implicit) & Hero Section */}
      <section className="flex-grow flex items-center justify-center bg-white">
        <div className="py-24 px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Welcome to the Imblogl.io
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            A modern, multi-user blogging platform built with the latest tech.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild>
              <Link href="/blog">Read the Blog</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/posts">Go to Admin</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <p className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  Post Management
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Full CRUD operations for posts, including draft and published
                  status.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  Category Management
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Create, edit, and delete categories. Assign multiple
                  categories to any post.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}