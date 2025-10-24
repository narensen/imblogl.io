import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This layout is separate from the root layout's styling
    <div className="flex min-h-screen">
      <nav className="w-64 border-r bg-gray-50 p-4">
        <h2 className="mb-4 text-lg font-semibold">Admin Menu</h2>
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
      </nav>
      <main className="flex-1 p-8 bg-white">{children}</main>
    </div>
  );
}