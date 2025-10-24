'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Toaster } from '@/components/ui/sonner';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Admin Menu</h2>
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      <ul className="space-y-2">
        <li>
          <Link href="/" className="block rounded p-2 hover:bg-gray-200">
            Go to Home
          </Link>
        </li>
        <li>
          <Link href="/blog" className="block rounded p-2 hover:bg-gray-200">
            View Blog
          </Link>
        </li>
        <li className="pt-4 font-semibold">Manage</li>
        <li>
          <Link
            href="/admin/posts"
            className="block rounded p-2 hover:bg-gray-200"
          >
            Manage Posts
          </Link>
        </li>
        <li>
          <Link
            href="/admin/categories"
            className="block rounded p-2 hover:bg-gray-200"
          >
            Manage Categories
          </Link>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed z-50 h-full w-64 border-r bg-gray-50 p-4 
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-white">
        {/* Mobile Hamburger Button */}
        <div className="md:hidden mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        {children}
      </main>
      <Toaster />
    </div>
  );
}