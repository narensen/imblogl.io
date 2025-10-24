import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b">
      <nav
        className="container mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 text-lg font-bold">
            Imblogl.io  
          </Link>
        </div>
        <div className="flex gap-x-8">
          <Link href="/" className="text-sm font-semibold leading-6 text-gray-900">
            Home
          </Link>
          <Link href="/blog" className="text-sm font-semibold leading-6 text-gray-900">
            Blog
          </Link>
          <Link href="/admin/posts" className="text-sm font-semibold leading-6 text-gray-900">
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}